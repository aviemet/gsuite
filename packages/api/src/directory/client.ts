import {
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
}
