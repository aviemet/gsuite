import {
	directoryGroups,
	directoryOrganizationalUnits,
	directoryUsers,
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
}

let sharedMock: MockDirectoryClient | undefined

export function getSharedMockDirectoryClient(): MockDirectoryClient {
	return sharedMock || new MockDirectoryClient()
}
