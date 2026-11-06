import {
	type DirectoryAccount,
	directoryGroups,
	type DirectoryGroupUpdateRequest,
	directoryOrganizationalUnits,
	directoryUserGroupRole,
	directoryUsers,
	type DirectoryUserUpdate,
	type DirectoryUserUpdateRequest,
	nextGroupMembersForUser,
	SEED_WORKSPACE_ADMIN_EMAIL,
} from "@gsuite/shared"

import { HttpError } from "../http/errors"
import { type DirectoryClient, type DirectorySnapshot } from "./client"
import { directoryUserFromUpdate } from "./snapshot"

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

	async getGroup(groupId: string): Promise<DirectorySnapshot["groups"][number] | undefined> {
		const group = this.snapshot.groups.find((entry) => entry.id === groupId)
		if(!group) return undefined
		return {
			...group,
			members: group.members.map((member) => ({ ...member })),
		}
	}

	async loadUsersForEmails(emails: readonly string[]): Promise<DirectorySnapshot["users"]> {
		const wanted = new Set(emails.map((email) => email.trim().toLowerCase()))
		return this.snapshot.users.flatMap((user) => {
			if(!wanted.has(user.email)) return []
			return [{
				...user,
				groupIds: [...user.groupIds],
				organizationalUnitPaths: [...user.organizationalUnitPaths],
				phoneNumbers: user.phoneNumbers.map((phone) => ({ ...phone })),
			}]
		})
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

	async updateUser(request: DirectoryUserUpdateRequest): Promise<DirectorySnapshot["users"][number]> {
		const update = request.next
		const index = this.snapshot.users.findIndex((user) => user.email === update.email)
		if(index < 0) throw new HttpError("User not found", 404)
		const current = this.snapshot.users[index]
		this.snapshot.users[index] = directoryUserFromUpdate(current, update)
		this.applyUserGroups(update.email, update.groupIds, update.groupMemberships)
		const saved = this.snapshot.users[index]
		if(!saved) throw new HttpError("User not found", 404)
		return saved
	}

	async updateGroup(request: DirectoryGroupUpdateRequest): Promise<DirectorySnapshot["groups"][number]> {
		const update = request.next
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
		const saved = this.snapshot.groups[index]
		if(!saved) throw new HttpError("Group not found", 404)
		return saved
	}

	async checkUsers(): Promise<void> {}

	async checkGroups(): Promise<void> {}

	async checkGroupMembers(): Promise<void> {}

	async checkOrganizationalUnits(): Promise<void> {}

	private applyUserGroups(
		email: string,
		groupIds: readonly string[],
		memberships: DirectoryUserUpdate["groupMemberships"],
	): void {
		const nextIds = new Set(groupIds)
		this.snapshot.groups = this.snapshot.groups.map((group) => ({
			...group,
			members: nextGroupMembersForUser(
				group.members,
				email,
				nextIds.has(group.id),
				directoryUserGroupRole(group.id, memberships),
			),
		}))
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
