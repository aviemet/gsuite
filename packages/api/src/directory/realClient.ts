import { type DirectoryAccount, directoryScopes } from "@gsuite/shared"
import { JWT } from "google-auth-library"
import { google } from "googleapis"

import { requireServiceAccount } from "../google/serviceAccount"
import { type DirectoryClient, type DirectorySnapshot } from "./client"
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

	private admin() {
		return google.admin({
			version: "directory_v1",
			auth: createJwt(this.subjectEmail, directoryScopes),
		})
	}

	async listDirectory(): Promise<DirectorySnapshot> {
		const admin = this.admin()
		const users = await listPages<RawDirectoryUser>(async (pageToken) => {
			const response = await admin.users.list({
				customer: "my_customer",
				maxResults: 500,
				pageToken,
				projection: "basic",
			})
			const items = (response.data.users ?? []).flatMap((user) => {
				if(!user.primaryEmail) return []
				return [{
					email: user.primaryEmail,
					displayName: user.name?.fullName ?? user.primaryEmail,
					orgUnitPath: user.orgUnitPath ?? "/",
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
					return [{ groupId: group.id, email: member.email }]
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
		await this.admin().users.list({ customer: "my_customer", maxResults: 1 })
	}

	async checkGroups(): Promise<void> {
		await this.admin().groups.list({ customer: "my_customer", maxResults: 1 })
	}

	async checkOrganizationalUnits(): Promise<void> {
		await this.admin().orgunits.list({ customerId: "my_customer", type: "all" })
	}
}
