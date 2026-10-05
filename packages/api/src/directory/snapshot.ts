import { type DirectoryGroup, type DirectoryOrganizationalUnit, type DirectoryUser } from "@gsuite/shared"

import { type DirectorySnapshot } from "./client"

export interface RawDirectoryUser {
	email: string
	displayName: string
	orgUnitPath: string
}

export interface RawDirectoryGroup {
	id: string
	name: string
	email: string
}

export interface RawDirectoryMember {
	groupId: string
	email: string
}

export function organizationalUnitPaths(orgUnitPath: string): string[] {
	if(!orgUnitPath || orgUnitPath === "/") return ["/"]
	const segments = orgUnitPath.split("/").filter((segment) => segment.length > 0)
	const paths = ["/"]
	let current = ""
	for(const segment of segments) {
		current = `${current}/${segment}`
		paths.push(current)
	}
	return paths
}

export function buildDirectorySnapshot(input: {
	users: RawDirectoryUser[]
	groups: RawDirectoryGroup[]
	members: RawDirectoryMember[]
	organizationalUnits: DirectoryOrganizationalUnit[]
}): DirectorySnapshot {
	const groupIdsByEmail = new Map<string, string[]>()
	for(const member of input.members) {
		const email = member.email.toLowerCase()
		const groupIds = groupIdsByEmail.get(email) ?? []
		groupIds.push(member.groupId)
		groupIdsByEmail.set(email, groupIds)
	}

	const users: DirectoryUser[] = input.users.map((user) => ({
		email: user.email.toLowerCase(),
		displayName: user.displayName || user.email,
		signatureHtml: "",
		groupIds: groupIdsByEmail.get(user.email.toLowerCase()) ?? [],
		organizationalUnitPaths: organizationalUnitPaths(user.orgUnitPath),
	}))

	const groups: DirectoryGroup[] = input.groups.map((group) => ({
		id: group.id,
		name: group.name,
		email: group.email.toLowerCase(),
	}))

	const organizationalUnits = [...input.organizationalUnits]
	if(!organizationalUnits.some((unit) => unit.path === "/")) {
		organizationalUnits.unshift({ path: "/", name: "Workspace" })
	}

	return { users, groups, organizationalUnits }
}
