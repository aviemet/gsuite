import {
	type DirectoryAccount,
	directoryGroups,
	directoryOrganizationalUnits,
	directoryUsers,
	SEED_WORKSPACE_ADMIN_EMAIL,
} from "@gsuite/shared"

import { type DirectoryClient, type DirectorySnapshot } from "./client"

export class MockDirectoryClient implements DirectoryClient {
	async listDirectory(): Promise<DirectorySnapshot> {
		return {
			users: directoryUsers,
			groups: directoryGroups,
			organizationalUnits: directoryOrganizationalUnits,
		}
	}

	async getUser(email: string): Promise<DirectoryAccount | undefined> {
		const normalized = email.trim().toLowerCase()
		const fixture = directoryUsers.find((user) => user.email === normalized)
		if(!fixture) return undefined
		const domain = normalized.split("@")[1] ?? ""
		return {
			email: fixture.email,
			displayName: fixture.displayName,
			isAdmin: fixture.email === SEED_WORKSPACE_ADMIN_EMAIL,
			primaryDomain: domain,
		}
	}

	async checkUsers(): Promise<void> {}

	async checkGroups(): Promise<void> {}

	async checkOrganizationalUnits(): Promise<void> {}
}

let sharedMock: MockDirectoryClient | undefined

export function getSharedMockDirectoryClient(): MockDirectoryClient {
	return sharedMock || new MockDirectoryClient()
}
