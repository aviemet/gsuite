import {
	type DirectoryGroupMember,
	type DirectoryGroupMemberRole,
	directoryGroupMemberRoles,
	type DirectoryPhoneNumber,
	isDirectoryGroupMemberRole,
} from "./directoryFixtures"

export interface DirectoryUserGroupMembership {
	groupId: string
	role: DirectoryGroupMemberRole
}

export function directoryUserGroupRole(
	groupId: string,
	memberships: readonly DirectoryUserGroupMembership[] | undefined,
): DirectoryGroupMemberRole {
	const membership = memberships?.find((entry) => entry.groupId === groupId)
	return membership?.role ?? directoryGroupMemberRoles.member
}

export function nextGroupMembersForUser(
	members: readonly DirectoryGroupMember[],
	email: string,
	isMember: boolean,
	role: DirectoryGroupMemberRole,
): DirectoryGroupMember[] {
	const normalizedEmail = email.trim().toLowerCase()
	const existing = members.find((member) => member.email.toLowerCase() === normalizedEmail)
	if(!isMember) {
		if(!existing) return [...members]
		return members.filter((member) => member.email.toLowerCase() !== normalizedEmail)
	}
	if(!existing) return [...members, { email: normalizedEmail, role }]
	if(existing.role === role) return [...members]
	return members.map((member) => (
		member.email.toLowerCase() === normalizedEmail ? { ...member, role } : member
	))
}

export interface DirectoryUserUpdate {
	email: string
	givenName: string
	familyName: string
	organizationalUnitPath: string
	jobTitle: string
	department: string
	organization: string
	location: string
	employeeId: string
	address: string
	costCenter: string
	managerEmail: string
	phoneNumbers: DirectoryPhoneNumber[]
	groupIds: string[]
	groupMemberships?: DirectoryUserGroupMembership[]
}

export interface DirectoryGroupUpdate {
	id: string
	name: string
	email: string
	description: string
	members: DirectoryGroupMember[]
}

export interface DirectoryUserUpdateRequest {
	baseline: DirectoryUserUpdate
	next: DirectoryUserUpdate
}

export interface DirectoryGroupUpdateRequest {
	baseline: DirectoryGroupUpdate
	next: DirectoryGroupUpdate
}

export interface DirectoryMemberChanges {
	added: DirectoryGroupMember[]
	removed: DirectoryGroupMember[]
	updated: DirectoryGroupMember[]
}

export function memberChanges(
	currentMembers: readonly DirectoryGroupMember[],
	nextMembers: readonly DirectoryGroupMember[],
): DirectoryMemberChanges {
	const currentByEmail = new Map(currentMembers.map((member) => [member.email.toLowerCase(), member]))
	const nextByEmail = new Map(nextMembers.map((member) => [member.email.toLowerCase(), member]))

	return {
		added: nextMembers.filter((member) => !currentByEmail.has(member.email.toLowerCase())),
		removed: currentMembers.filter((member) => !nextByEmail.has(member.email.toLowerCase())),
		updated: nextMembers.filter((member) => {
			const current = currentByEmail.get(member.email.toLowerCase())
			return current !== undefined && current.role !== member.role
		}),
	}
}

export function isDirectoryGroupMember(value: unknown): value is DirectoryGroupMember {
	if(!value || typeof value !== "object") return false
	if(!Object.hasOwn(value, "email") || !Object.hasOwn(value, "role")) return false
	const email = Reflect.get(value, "email")
	const role = Reflect.get(value, "role")
	return typeof email === "string" && email.includes("@") && isDirectoryGroupMemberRole(role)
}
