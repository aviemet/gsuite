import {
	type DirectoryAccount,
	type DirectoryGroup,
	type DirectoryGroupUpdate,
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
	type DirectoryUserUpdate,
} from "@gsuite/shared"

export interface DirectorySnapshot {
	users: DirectoryUser[]
	groups: DirectoryGroup[]
	organizationalUnits: DirectoryOrganizationalUnit[]
}

export interface DirectoryClient {
	listDirectory(): Promise<DirectorySnapshot>
	getUser(email: string): Promise<DirectoryAccount | undefined>
	updateUser(update: DirectoryUserUpdate): Promise<DirectorySnapshot>
	updateGroup(update: DirectoryGroupUpdate): Promise<DirectorySnapshot>
	checkUsers(): Promise<void>
	checkGroups(): Promise<void>
	checkGroupMembers(): Promise<void>
	checkOrganizationalUnits(): Promise<void>
}
