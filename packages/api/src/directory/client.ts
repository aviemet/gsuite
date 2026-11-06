import {
	type DirectoryAccount,
	type DirectoryGroup,
	type DirectoryGroupUpdateRequest,
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
	type DirectoryUserUpdateRequest,
} from "@gsuite/shared"

export interface DirectorySnapshot {
	users: DirectoryUser[]
	groups: DirectoryGroup[]
	organizationalUnits: DirectoryOrganizationalUnit[]
}

export interface DirectoryClient {
	listDirectory(): Promise<DirectorySnapshot>
	getUser(email: string): Promise<DirectoryAccount | undefined>
	getGroup(groupId: string): Promise<DirectoryGroup | undefined>
	loadUsersForEmails(emails: readonly string[]): Promise<DirectoryUser[]>
	updateUser(request: DirectoryUserUpdateRequest): Promise<DirectoryUser>
	updateGroup(request: DirectoryGroupUpdateRequest): Promise<DirectoryGroup>
	checkUsers(): Promise<void>
	checkGroups(): Promise<void>
	checkGroupMembers(): Promise<void>
	checkOrganizationalUnits(): Promise<void>
}
