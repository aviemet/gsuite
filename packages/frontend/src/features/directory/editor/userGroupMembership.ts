import {
	type DirectoryGroup,
	type DirectoryGroupMemberRole,
	directoryGroupMemberRoles,
} from "@/shared/directoryFixtures"
import { type DirectoryUserGroupMembership } from "@/shared/directoryUpdate"

import { filterDirectoryGroups } from "../GroupsTable/filterDirectoryGroups"

export function directoryGroupRoleForUser(
	email: string,
	group: DirectoryGroup,
	memberships: readonly DirectoryUserGroupMembership[] | undefined,
): DirectoryGroupMemberRole {
	const membership = memberships?.find((entry) => entry.groupId === group.id)
	if(membership) return membership.role
	const normalizedEmail = email.trim().toLowerCase()
	const member = group.members.find((entry) => entry.email.toLowerCase() === normalizedEmail)
	return member?.role ?? directoryGroupMemberRoles.member
}

function compareGroupsByName(left: DirectoryGroup, right: DirectoryGroup): number {
	const byName = left.name.localeCompare(right.name)
	if(byName !== 0) return byName
	return left.email.localeCompare(right.email)
}

export function selectedDirectoryGroups(
	groups: readonly DirectoryGroup[],
	groupIds: readonly string[],
): DirectoryGroup[] {
	const selectedIds = new Set(groupIds)
	return groups.filter((group) => selectedIds.has(group.id)).sort(compareGroupsByName)
}

export function availableDirectoryGroups(
	groups: readonly DirectoryGroup[],
	groupIds: readonly string[],
	searchQuery: string,
): DirectoryGroup[] {
	const selectedIds = new Set(groupIds)
	const available = groups
		.filter((group) => !selectedIds.has(group.id))
		.sort(compareGroupsByName)
	return filterDirectoryGroups(available, searchQuery)
}

export function selectedDirectoryGroupMatchCount(
	groups: readonly DirectoryGroup[],
	groupIds: readonly string[],
	searchQuery: string,
): number {
	if(searchQuery.trim().length === 0) return 0
	return filterDirectoryGroups(selectedDirectoryGroups(groups, groupIds), searchQuery).length
}

export function userGroupCatalogMessage(
	searchQuery: string,
	availableCount: number,
	selectedMatchCount: number,
): string | null {
	if(availableCount > 0) return null
	if(searchQuery.trim().length > 0) {
		if(selectedMatchCount === 1) return "That group is already selected"
		if(selectedMatchCount > 1) return "Those groups are already selected"
		return "No groups found"
	}
	return "No groups to add"
}

export function revealRowScrollTop(
	scrollTop: number,
	viewportHeight: number,
	rowTop: number,
	rowHeight: number,
): number {
	if(rowTop < scrollTop) return rowTop
	const rowBottom = rowTop + rowHeight
	if(rowBottom > scrollTop + viewportHeight) return Math.max(0, rowBottom - viewportHeight)
	return scrollTop
}
