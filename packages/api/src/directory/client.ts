import {
	type DirectoryAccount,
	type DirectoryGroup,
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
} from "@gsuite/shared"

export interface DirectorySnapshot {
	users: DirectoryUser[]
	groups: DirectoryGroup[]
	organizationalUnits: DirectoryOrganizationalUnit[]
}

export interface DirectoryClient {
	listDirectory(): Promise<DirectorySnapshot>
	getUser(email: string): Promise<DirectoryAccount | undefined>
	checkUsers(): Promise<void>
	checkGroups(): Promise<void>
	checkOrganizationalUnits(): Promise<void>
}
