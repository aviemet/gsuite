import {
	type DirectoryAccount,
	type DirectoryGroup,
	type DirectoryGroupMemberRole,
	directoryGroupMemberScope,
	directoryGroupScope,
	type DirectoryGroupUpdateRequest,
	type DirectoryOrganizationalUnit,
	directoryOrgUnitScope,
	directoryScopes,
	type DirectoryUser,
	directoryUserScope,
	type DirectoryUserUpdate,
	type DirectoryUserUpdateRequest,
	memberChanges,
} from "@gsuite/shared"
import { JWT } from "google-auth-library"
import { google } from "googleapis"

import { requireServiceAccount } from "../google/serviceAccount"
import { HttpError } from "../http/errors"
import { type DirectoryClient, type DirectorySnapshot } from "./client"
import {
	type DirectoryMembershipChange,
	directoryUserMembershipChanges,
	directoryUserNeedsProfileRead,
	directoryUserProfileChanges,
	hasDirectoryUserProfileChange,
} from "./directoryUpdateDiff"
import { googleGroupPatchBody, type GoogleUserPatchBody, googleUserPatchBody } from "./googleDirectoryUpdate"
import { type GoogleDirectoryUserLike, mapDirectoryUserProfile } from "./mapDirectoryUserProfile"
import { mapWithConcurrency } from "./mapWithConcurrency"
import {
	buildDirectorySnapshot,
	directoryUserFromRaw,
	directoryUserFromUpdate,
	type RawDirectoryGroup,
	type RawDirectoryMember,
	type RawDirectoryUser,
} from "./snapshot"

const DIRECTORY_READ_CONCURRENCY = 8
const DIRECTORY_USER_LIST_THRESHOLD = 500

export interface DirectoryAdminApi {
	users: {
		list(params: {
			customer: string
			maxResults: number
			pageToken?: string
			projection: "full"
		}): Promise<{
			data: {
				users?: GoogleDirectoryUserLike[] | null
				nextPageToken?: string | null
			}
		}>
		get(params: {
			userKey: string
			projection: "full"
		}): Promise<{ data: GoogleDirectoryUserLike }>
		patch(params: {
			userKey: string
			requestBody: GoogleUserPatchBody
		}): Promise<{ data: GoogleDirectoryUserLike }>
	}
	groups: {
		list(params: {
			customer: string
			maxResults: number
			pageToken?: string
		}): Promise<{
			data: {
				groups?: Array<{
					id?: string | null
					email?: string | null
					name?: string | null
					description?: string | null
				}> | null
				nextPageToken?: string | null
			}
		}>
		get(params: { groupKey: string }): Promise<{
			data: {
				id?: string | null
				email?: string | null
				name?: string | null
				description?: string | null
			}
		}>
		patch(params: {
			groupKey: string
			requestBody: {
				name?: string
				email?: string
				description?: string
			}
		}): Promise<{ data: unknown }>
	}
	members: {
		list(params: {
			groupKey: string
			maxResults: number
			pageToken?: string
		}): Promise<{
			data: {
				members?: Array<{
					email?: string | null
					role?: string | null
				}> | null
				nextPageToken?: string | null
			}
		}>
		insert(params: {
			groupKey: string
			requestBody: { email: string, role: DirectoryGroupMemberRole }
		}): Promise<{ data: unknown }>
		update(params: {
			groupKey: string
			memberKey: string
			requestBody: { email: string, role: DirectoryGroupMemberRole }
		}): Promise<{ data: unknown }>
		delete(params: { groupKey: string, memberKey: string }): Promise<{ data: unknown }>
	}
	orgunits: {
		list(params: {
			customerId: string
			type: "all"
		}): Promise<{
			data: {
				organizationUnits?: Array<{
					orgUnitPath?: string | null
					name?: string | null
				}> | null
			}
		}>
	}
}

function createJwt(subject: string, scopes: readonly string[]): JWT {
	const account = requireServiceAccount()
	return new JWT({
		email: account.clientEmail,
		key: account.privateKey,
		scopes: [...scopes],
		subject,
	})
}

function createDirectoryAdmin(subjectEmail: string): DirectoryAdminApi {
	const admin = google.admin({
		version: "directory_v1",
		auth: createJwt(subjectEmail, directoryScopes),
	})
	return {
		users: {
			list: (params) => admin.users.list(params),
			get: (params) => admin.users.get(params),
			patch: (params) => admin.users.patch(params),
		},
		groups: {
			list: (params) => admin.groups.list(params),
			get: (params) => admin.groups.get(params),
			patch: (params) => admin.groups.patch(params),
		},
		members: {
			list: (params) => admin.members.list(params),
			insert: (params) => admin.members.insert(params),
			update: (params) => admin.members.update(params),
			delete: (params) => admin.members.delete(params),
		},
		orgunits: {
			list: (params) => admin.orgunits.list(params),
		},
	}
}

function statusCode(error: unknown): number | undefined {
	if(!error || typeof error !== "object" || !Object.hasOwn(error, "code")) return undefined
	const code = Reflect.get(error, "code")
	return typeof code === "number" ? code : undefined
}

function isNotFound(error: unknown): boolean {
	return statusCode(error) === 404
}

function isConflict(error: unknown): boolean {
	return statusCode(error) === 409
}

async function listPages<T>(
	readPage: (pageToken: string | undefined) => Promise<{ items: T[], nextPageToken: string | undefined }>,
): Promise<T[]> {
	const items: T[] = []
	let pageToken: string | undefined
	do {
		const page = await readPage(pageToken)
		items.push(...page.items)
		pageToken = page.nextPageToken
	} while(pageToken)
	return items
}

function rawUserFromGoogle(user: GoogleDirectoryUserLike): RawDirectoryUser | undefined {
	if(!user.primaryEmail) return undefined
	const profile = mapDirectoryUserProfile(user)
	return {
		email: user.primaryEmail,
		displayName: user.name?.fullName ?? user.primaryEmail,
		orgUnitPath: user.orgUnitPath ?? "/",
		...profile,
	}
}

function directoryUserFromGoogle(user: GoogleDirectoryUserLike, next: DirectoryUserUpdate): DirectoryUser {
	const raw = rawUserFromGoogle(user)
	if(!raw) throw new HttpError("User not found", 404)
	return {
		...directoryUserFromRaw(raw),
		groupIds: next.groupIds.flatMap((groupId) => {
			const trimmed = groupId.trim()
			return trimmed.length === 0 ? [] : [trimmed]
		}),
	}
}

async function listUsers(admin: DirectoryAdminApi): Promise<RawDirectoryUser[]> {
	return listPages(async (pageToken) => {
		const response = await admin.users.list({
			customer: "my_customer",
			maxResults: 500,
			pageToken,
			projection: "full",
		})
		const items = (response.data.users ?? []).flatMap((user) => {
			const raw = rawUserFromGoogle(user)
			return raw ? [raw] : []
		})
		return { items, nextPageToken: response.data.nextPageToken ?? undefined }
	})
}

async function listGroups(admin: DirectoryAdminApi): Promise<RawDirectoryGroup[]> {
	return listPages(async (pageToken) => {
		const response = await admin.groups.list({
			customer: "my_customer",
			maxResults: 200,
			pageToken,
		})
		const items = (response.data.groups ?? []).flatMap((group) => {
			if(!group.id || !group.email) return []
			return [{
				id: group.id,
				name: group.name ?? group.email,
				email: group.email,
				description: group.description ?? "",
			}]
		})
		return { items, nextPageToken: response.data.nextPageToken ?? undefined }
	})
}

async function listMembers(admin: DirectoryAdminApi, group: RawDirectoryGroup): Promise<RawDirectoryMember[]> {
	return listPages(async (pageToken) => {
		const response = await admin.members.list({
			groupKey: group.id,
			maxResults: 200,
			pageToken,
		})
		const items = (response.data.members ?? []).flatMap((member) => {
			if(!member.email) return []
			return [{
				groupId: group.id,
				email: member.email,
				role: member.role ?? undefined,
			}]
		})
		return { items, nextPageToken: response.data.nextPageToken ?? undefined }
	})
}

async function listOrganizationalUnits(admin: DirectoryAdminApi): Promise<DirectoryOrganizationalUnit[]> {
	const response = await admin.orgunits.list({
		customerId: "my_customer",
		type: "all",
	})
	return (response.data.organizationUnits ?? []).flatMap((unit) => {
		if(!unit.orgUnitPath) return []
		return [{
			path: unit.orgUnitPath,
			name: unit.name ?? unit.orgUnitPath,
		}]
	})
}

async function readGoogleUser(admin: DirectoryAdminApi, email: string): Promise<GoogleDirectoryUserLike> {
	try {
		const response = await admin.users.get({ userKey: email, projection: "full" })
		if(!response.data.primaryEmail) throw new HttpError("User not found", 404)
		return response.data
	} catch (error) {
		if(error instanceof HttpError) throw error
		if(isNotFound(error)) throw new HttpError("User not found", 404)
		throw error
	}
}

export class RealDirectoryClient implements DirectoryClient {
	private cachedAdmin: DirectoryAdminApi | undefined

	constructor(private readonly subjectEmail: string, admin?: DirectoryAdminApi) {
		this.cachedAdmin = admin
	}

	private admin(): DirectoryAdminApi {
		if(!this.cachedAdmin) this.cachedAdmin = createDirectoryAdmin(this.subjectEmail)
		return this.cachedAdmin
	}

	private adminWith(scopes: readonly string[]) {
		return google.admin({
			version: "directory_v1",
			auth: createJwt(this.subjectEmail, scopes),
		})
	}

	async listDirectory(): Promise<DirectorySnapshot> {
		const admin = this.admin()
		const [users, groups, organizationalUnits] = await Promise.all([
			listUsers(admin),
			listGroups(admin),
			listOrganizationalUnits(admin),
		])
		const membersByGroup = await mapWithConcurrency(groups, DIRECTORY_READ_CONCURRENCY, (group) => (
			listMembers(admin, group)
		))
		return buildDirectorySnapshot({
			users,
			groups,
			members: membersByGroup.flat(),
			organizationalUnits,
		})
	}

	async loadUsersForEmails(emails: readonly string[]): Promise<DirectoryUser[]> {
		const wanted = [...new Set(emails.flatMap((email) => {
			const normalized = email.trim().toLowerCase()
			return normalized.includes("@") ? [normalized] : []
		}))]
		if(wanted.length === 0) return []
		const admin = this.admin()
		if(wanted.length >= DIRECTORY_USER_LIST_THRESHOLD) {
			const users = await listUsers(admin)
			const wantedEmails = new Set(wanted)
			return users.flatMap((user) => (
				wantedEmails.has(user.email.toLowerCase()) ? [directoryUserFromRaw(user)] : []
			))
		}
		const loaded = await mapWithConcurrency(wanted, DIRECTORY_READ_CONCURRENCY, async (email) => {
			try {
				const response = await admin.users.get({ userKey: email, projection: "full" })
				const raw = rawUserFromGoogle(response.data)
				return raw ? directoryUserFromRaw(raw) : undefined
			} catch (error) {
				if(isNotFound(error)) return undefined
				throw error
			}
		})
		return loaded.flatMap((user) => user ? [user] : [])
	}

	async updateUser(request: DirectoryUserUpdateRequest): Promise<DirectoryUser> {
		const admin = this.admin()
		const changes = directoryUserProfileChanges(request.baseline, request.next)
		const saved = await this.writeUserProfile(admin, request.next, changes)
		await this.writeMembershipChanges(
			admin,
			request.next.email,
			directoryUserMembershipChanges(request.baseline, request.next),
		)
		return saved ?? directoryUserFromUpdate(undefined, request.next)
	}

	async updateGroup(request: DirectoryGroupUpdateRequest): Promise<DirectoryGroup> {
		const admin = this.admin()
		const requestBody = googleGroupPatchBody(request.baseline, request.next)
		if(requestBody) {
			try {
				await admin.groups.patch({ groupKey: request.next.id, requestBody })
			} catch (error) {
				if(isNotFound(error)) throw new HttpError("Group not found", 404)
				throw error
			}
		}
		const changes = memberChanges(request.baseline.members, request.next.members)
		for(const member of changes.removed) {
			await this.deleteMember(admin, request.next.id, member.email)
		}
		for(const member of changes.added) {
			await this.insertMember(admin, request.next.id, member.email, member.role)
		}
		for(const member of changes.updated) {
			await admin.members.update({
				groupKey: request.next.id,
				memberKey: member.email,
				requestBody: { email: member.email, role: member.role },
			})
		}
		return {
			id: request.next.id,
			name: request.next.name.trim(),
			email: request.next.email.trim().toLowerCase(),
			description: request.next.description.trim(),
			members: request.next.members.map((member) => ({
				email: member.email.trim().toLowerCase(),
				role: member.role,
			})),
		}
	}

	async getUser(email: string): Promise<DirectoryAccount | undefined> {
		const admin = this.admin()
		try {
			const response = await admin.users.get({ userKey: email, projection: "full" })
			const primaryEmail = response.data.primaryEmail
			if(!primaryEmail) return undefined
			const domain = primaryEmail.split("@")[1] ?? ""
			return {
				email: primaryEmail.toLowerCase(),
				displayName: response.data.name?.fullName ?? primaryEmail,
				isAdmin: response.data.isAdmin === true,
				primaryDomain: domain,
			}
		} catch (error) {
			if(isNotFound(error)) return undefined
			throw error
		}
	}

	async getGroup(groupId: string): Promise<DirectoryGroup | undefined> {
		try {
			const response = await this.admin().groups.get({ groupKey: groupId })
			const group = response.data
			if(!group.id || !group.email) return undefined
			return {
				id: group.id,
				name: group.name ?? group.email,
				email: group.email.toLowerCase(),
				description: group.description ?? "",
				members: [],
			}
		} catch (error) {
			if(isNotFound(error)) return undefined
			throw error
		}
	}

	async checkUsers(): Promise<void> {
		await this.adminWith([directoryUserScope]).users.list({ customer: "my_customer", maxResults: 1 })
	}

	async checkGroups(): Promise<void> {
		await this.adminWith([directoryGroupScope]).groups.list({ customer: "my_customer", maxResults: 1 })
	}

	async checkGroupMembers(): Promise<void> {
		try {
			await this.adminWith([directoryGroupMemberScope]).members.list({
				groupKey: "scope-check",
				maxResults: 1,
			})
		} catch (error) {
			if(isNotFound(error)) return
			throw error
		}
	}

	async checkOrganizationalUnits(): Promise<void> {
		await this.adminWith([directoryOrgUnitScope]).orgunits.list({ customerId: "my_customer", type: "all" })
	}

	private async writeUserProfile(
		admin: DirectoryAdminApi,
		next: DirectoryUserUpdate,
		changes: ReturnType<typeof directoryUserProfileChanges>,
	): Promise<DirectoryUser | undefined> {
		if(!hasDirectoryUserProfileChange(changes)) return undefined
		const current = directoryUserNeedsProfileRead(changes)
			? await readGoogleUser(admin, next.email)
			: undefined
		const requestBody = googleUserPatchBody(changes, next, current)
		if(!requestBody) return current ? directoryUserFromGoogle(current, next) : undefined
		try {
			const response = await admin.users.patch({ userKey: next.email, requestBody })
			const patched = response.data.primaryEmail ? response.data : current
			if(!patched?.primaryEmail) throw new HttpError("User not found", 404)
			return directoryUserFromGoogle(patched, next)
		} catch (error) {
			if(error instanceof HttpError) throw error
			if(isNotFound(error)) throw new HttpError("User not found", 404)
			throw error
		}
	}

	private async writeMembershipChanges(
		admin: DirectoryAdminApi,
		email: string,
		changes: readonly DirectoryMembershipChange[],
	): Promise<void> {
		for(const change of changes) {
			if(change.action === "delete") {
				await this.deleteMember(admin, change.groupId, email)
				continue
			}
			if(change.action === "insert") {
				await this.insertMember(admin, change.groupId, email, change.role)
				continue
			}
			await admin.members.update({
				groupKey: change.groupId,
				memberKey: email,
				requestBody: { email, role: change.role },
			})
		}
	}

	private async insertMember(
		admin: DirectoryAdminApi,
		groupKey: string,
		email: string,
		role: DirectoryGroupMemberRole,
	): Promise<void> {
		try {
			await admin.members.insert({
				groupKey,
				requestBody: { email, role },
			})
		} catch (error) {
			if(!isConflict(error)) throw error
			await admin.members.update({
				groupKey,
				memberKey: email,
				requestBody: { email, role },
			})
		}
	}

	private async deleteMember(admin: DirectoryAdminApi, groupKey: string, email: string): Promise<void> {
		try {
			await admin.members.delete({ groupKey, memberKey: email })
		} catch (error) {
			if(!isNotFound(error)) throw error
		}
	}
}
