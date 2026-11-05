import {
	type DirectoryGroupMember,
	type DirectoryUserGroupMembership,
	directoryUserGroupRole,
} from "@gsuite/shared"

export type UserGroupMembershipChange =
	| { action: "insert", groupId: string, role: DirectoryUserGroupMembership["role"] }
	| { action: "update", groupId: string, role: DirectoryUserGroupMembership["role"] }
	| { action: "delete", groupId: string }

export function userGroupMembershipChanges(
	email: string,
	groups: readonly { id: string, members: readonly DirectoryGroupMember[] }[],
	nextGroupIds: readonly string[],
	memberships: readonly DirectoryUserGroupMembership[] | undefined,
): UserGroupMembershipChange[] {
	const normalizedEmail = email.trim().toLowerCase()
	const nextIds = new Set(nextGroupIds)
	const changes: UserGroupMembershipChange[] = []
	const currentGroupIds = new Set<string>()

	for(const group of groups) {
		const existing = group.members.find((member) => member.email.toLowerCase() === normalizedEmail)
		if(!existing) continue
		currentGroupIds.add(group.id)
		if(!nextIds.has(group.id)) {
			changes.push({ action: "delete", groupId: group.id })
			continue
		}
		const role = directoryUserGroupRole(group.id, memberships)
		if(existing.role !== role) changes.push({ action: "update", groupId: group.id, role })
	}

	const insertedGroupIds = new Set<string>()
	for(const groupId of nextGroupIds) {
		if(currentGroupIds.has(groupId) || insertedGroupIds.has(groupId)) continue
		insertedGroupIds.add(groupId)
		changes.push({
			action: "insert",
			groupId,
			role: directoryUserGroupRole(groupId, memberships),
		})
	}

	return changes
}
