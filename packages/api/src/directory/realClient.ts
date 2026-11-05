import {
	type DirectoryAccount,
	directoryGroupMemberScope,
	directoryGroupScope,
	type DirectoryGroupUpdate,
	directoryOrgUnitScope,
	directoryScopes,
	directoryUserScope,
	type DirectoryUserUpdate,
	memberChanges,
} from "@gsuite/shared"
import { JWT } from "google-auth-library"
import { google } from "googleapis"

import { requireServiceAccount } from "../google/serviceAccount"
import { HttpError } from "../http/errors"
import { type DirectoryClient, type DirectorySnapshot } from "./client"
import { googleGroupUpdateBody, googleUserUpdateBody } from "./googleDirectoryUpdate"
import { mapDirectoryUserProfile } from "./mapDirectoryUserProfile"
import { buildDirectorySnapshot, type RawDirectoryGroup, type RawDirectoryMember, type RawDirectoryUser } from "./snapshot"

function createJwt(subject: string, scopes: readonly string[]): JWT {
	const account = requireServiceAccount()
	return new JWT({
		email: account.clientEmail,
		key: account.privateKey,
		scopes: [...scopes],
		subject,
	})
}

function isNotFound(error: unknown): boolean {
	if(!error || typeof error !== "object" || !Object.hasOwn(error, "code")) return false
	return Reflect.get(error, "code") === 404
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

export class RealDirectoryClient implements DirectoryClient {
	constructor(private readonly subjectEmail: string) {}

	private adminWith(scopes: readonly string[]) {
		return google.admin({
			version: "directory_v1",
			auth: createJwt(this.subjectEmail, scopes),
		})
	}

	private admin() {
		return this.adminWith(directoryScopes)
	}

	async listDirectory(): Promise<DirectorySnapshot> {
		const admin = this.admin()
		const users = await listPages<RawDirectoryUser>(async (pageToken) => {
			const response = await admin.users.list({
				customer: "my_customer",
				maxResults: 500,
				pageToken,
				projection: "full",
			})
			const items = (response.data.users ?? []).flatMap((user) => {
				if(!user.primaryEmail) return []
				const profile = mapDirectoryUserProfile(user)
				return [{
					email: user.primaryEmail,
					displayName: user.name?.fullName ?? user.primaryEmail,
					orgUnitPath: user.orgUnitPath ?? "/",
					...profile,
				}]
			})
			return { items, nextPageToken: response.data.nextPageToken ?? undefined }
		})
		const groups = await listPages<RawDirectoryGroup>(async (pageToken) => {
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
		const members: RawDirectoryMember[] = []
		for(const group of groups) {
			const groupMembers = await listPages<RawDirectoryMember>(async (pageToken) => {
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
			members.push(...groupMembers)
		}
		const orgUnitsResponse = await admin.orgunits.list({
			customerId: "my_customer",
			type: "all",
		})
		const organizationalUnits = (orgUnitsResponse.data.organizationUnits ?? []).flatMap((unit) => {
			if(!unit.orgUnitPath) return []
			return [{
				path: unit.orgUnitPath,
				name: unit.name ?? unit.orgUnitPath,
			}]
		})
		return buildDirectorySnapshot({ users, groups, members, organizationalUnits })
	}

	async updateUser(update: DirectoryUserUpdate): Promise<DirectorySnapshot> {
		const before = await this.listDirectory()
		const current = before.users.find((user) => user.email === update.email)
		if(!current) throw new HttpError("User not found", 404)
		const admin = this.admin()
		await admin.users.update({
			userKey: update.email,
			requestBody: googleUserUpdateBody(update),
		})
		await this.syncUserGroups(update.email, current.groupIds, update.groupIds)
		return this.listDirectory()
	}

	private async syncUserGroups(
		email: string,
		currentGroupIds: readonly string[],
		nextGroupIds: readonly string[],
	): Promise<void> {
		const admin = this.admin()
		const currentIds = new Set(currentGroupIds)
		const nextIds = new Set(nextGroupIds)
		for(const groupId of nextIds) {
			if(currentIds.has(groupId)) continue
			await admin.members.insert({
				groupKey: groupId,
				requestBody: { email, role: "MEMBER" },
			})
		}
		for(const groupId of currentIds) {
			if(nextIds.has(groupId)) continue
			await admin.members.delete({ groupKey: groupId, memberKey: email })
		}
	}

	async updateGroup(update: DirectoryGroupUpdate): Promise<DirectorySnapshot> {
		const before = await this.listDirectory()
		const current = before.groups.find((group) => group.id === update.id)
		if(!current) throw new HttpError("Group not found", 404)
		const admin = this.admin()
		await admin.groups.update({
			groupKey: update.id,
			requestBody: googleGroupUpdateBody(update),
		})
		const changes = memberChanges(current.members, update.members)
		for(const member of changes.removed) {
			await admin.members.delete({ groupKey: update.id, memberKey: member.email })
		}
		for(const member of changes.added) {
			await admin.members.insert({
				groupKey: update.id,
				requestBody: { email: member.email, role: member.role },
			})
		}
		for(const member of changes.updated) {
			await admin.members.update({
				groupKey: update.id,
				memberKey: member.email,
				requestBody: { email: member.email, role: member.role },
			})
		}
		return this.listDirectory()
	}

	async getUser(email: string): Promise<DirectoryAccount | undefined> {
		const admin = this.admin()
		try {
			const response = await admin.users.get({ userKey: email })
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
}
