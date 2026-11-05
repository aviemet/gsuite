import {
	type DirectoryAccount,
	directoryGroups,
	type DirectoryGroupUpdate,
	directoryOrganizationalUnits,
	directoryUsers,
	type DirectoryUserUpdate,
	SEED_WORKSPACE_ADMIN_EMAIL,
} from "@gsuite/shared"

import { HttpError } from "../http/errors"
import { type DirectoryClient, type DirectorySnapshot } from "./client"
import { organizationalUnitPaths } from "./snapshot"

function cloneSnapshot(): DirectorySnapshot {
	return {
		users: directoryUsers.map((user) => ({
			...user,
			groupIds: [...user.groupIds],
			organizationalUnitPaths: [...user.organizationalUnitPaths],
			phoneNumbers: user.phoneNumbers.map((phone) => ({ ...phone })),
		})),
		groups: directoryGroups.map((group) => ({
			...group,
			members: group.members.map((member) => ({ ...member })),
		})),
		organizationalUnits: directoryOrganizationalUnits.map((unit) => ({ ...unit })),
	}
}

export class MockDirectoryClient implements DirectoryClient {
	private snapshot: DirectorySnapshot

	constructor(snapshot: DirectorySnapshot = cloneSnapshot()) {
		this.snapshot = snapshot
	}

	async listDirectory(): Promise<DirectorySnapshot> {
		return this.snapshot
	}

	async getUser(email: string): Promise<DirectoryAccount | undefined> {
		const normalized = email.trim().toLowerCase()
		const fixture = this.snapshot.users.find((user) => user.email === normalized)
		if(!fixture) return undefined
		const domain = normalized.split("@")[1] ?? ""
		return {
			email: fixture.email,
			displayName: fixture.displayName,
			isAdmin: fixture.email === SEED_WORKSPACE_ADMIN_EMAIL,
			primaryDomain: domain,
		}
	}

	async updateUser(update: DirectoryUserUpdate): Promise<DirectorySnapshot> {
		const index = this.snapshot.users.findIndex((user) => user.email === update.email)
		if(index < 0) throw new HttpError("User not found", 404)
		const current = this.snapshot.users[index]
		const givenName = update.givenName.trim()
		const familyName = update.familyName.trim()
		const displayName = `${ givenName } ${ familyName }`.trim() || current.displayName
		this.snapshot.users[index] = {
			...current,
			displayName,
			givenName,
			familyName,
			jobTitle: update.jobTitle,
			department: update.department,
			organization: update.organization,
			location: update.location,
			employeeId: update.employeeId,
			address: update.address,
			costCenter: update.costCenter,
			managerEmail: update.managerEmail,
			phoneNumbers: update.phoneNumbers.map((phone) => ({ ...phone })),
			groupIds: [...update.groupIds],
			organizationalUnitPaths: organizationalUnitPaths(update.organizationalUnitPath),
		}
		this.applyUserGroups(update.email, update.groupIds)
		return this.snapshot
	}

	async updateGroup(update: DirectoryGroupUpdate): Promise<DirectorySnapshot> {
		const index = this.snapshot.groups.findIndex((group) => group.id === update.id)
		if(index < 0) throw new HttpError("Group not found", 404)
		const members = update.members.map((member) => ({
			email: member.email.toLowerCase(),
			role: member.role,
		}))
		this.snapshot.groups[index] = {
			...this.snapshot.groups[index],
			name: update.name.trim(),
			email: update.email.toLowerCase(),
			description: update.description.trim(),
			members,
		}
		const memberEmails = new Set(members.map((member) => member.email))
		this.snapshot.users = this.snapshot.users.map((user) => {
			const isMember = memberEmails.has(user.email)
			const hasGroup = user.groupIds.includes(update.id)
			if(isMember && !hasGroup) {
				return { ...user, groupIds: [...user.groupIds, update.id] }
			}
			if(!isMember && hasGroup) {
				return { ...user, groupIds: user.groupIds.filter((groupId) => groupId !== update.id) }
			}
			return user
		})
		return this.snapshot
	}

	async checkUsers(): Promise<void> {}

	async checkGroups(): Promise<void> {}

	async checkGroupMembers(): Promise<void> {}

	async checkOrganizationalUnits(): Promise<void> {}

	private applyUserGroups(email: string, groupIds: readonly string[]): void {
		const nextIds = new Set(groupIds)
		this.snapshot.groups = this.snapshot.groups.map((group) => {
			const isMember = nextIds.has(group.id)
			const existing = group.members.find((member) => member.email === email)
			if(isMember && !existing) {
				return {
					...group,
					members: [...group.members, { email, role: "MEMBER" }],
				}
			}
			if(!isMember && existing) {
				return {
					...group,
					members: group.members.filter((member) => member.email !== email),
				}
			}
			return group
		})
	}
}

let sharedMock: MockDirectoryClient | undefined

export function getSharedMockDirectoryClient(): MockDirectoryClient {
	if(!sharedMock) sharedMock = new MockDirectoryClient()
	return sharedMock
}

export function resetSharedMockDirectoryClient(): void {
	sharedMock = undefined
}
