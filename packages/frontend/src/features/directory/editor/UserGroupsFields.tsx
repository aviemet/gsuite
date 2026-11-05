import { Stack } from "@mantine/core"
import { useMemo, useState } from "react"

import {
	type DirectoryGroup,
	type DirectoryGroupMemberRole,
	directoryGroupMemberRoles,
} from "@/shared/directoryFixtures"
import { type DirectoryUserGroupMembership, type DirectoryUserUpdate } from "@/shared/directoryUpdate"

import { SelectedUserGroups } from "./SelectedUserGroups"
import { UserGroupCatalog } from "./UserGroupCatalog"
import {
	availableDirectoryGroups,
	directoryGroupRoleForUser,
	selectedDirectoryGroupMatchCount,
	selectedDirectoryGroups,
	userGroupCatalogMessage,
} from "./userGroupMembership"

interface UserGroupsFieldsProps {
	value: DirectoryUserUpdate
	groups: readonly DirectoryGroup[]
	disabled: boolean
	onChange: (value: DirectoryUserUpdate) => void
}

export function UserGroupsFields({
	value,
	groups,
	disabled,
	onChange,
}: UserGroupsFieldsProps) {
	const [searchQuery, setSearchQuery] = useState("")
	const [justAddedGroupId, setJustAddedGroupId] = useState<string | null>(null)
	const selectedGroups = useMemo(
		() => selectedDirectoryGroups(groups, value.groupIds).map((group) => ({
			group,
			role: directoryGroupRoleForUser(value.email, group, value.groupMemberships),
		})),
		[groups, value.email, value.groupIds, value.groupMemberships],
	)
	const availableGroups = useMemo(
		() => availableDirectoryGroups(groups, value.groupIds, searchQuery),
		[groups, value.groupIds, searchQuery],
	)
	const statusMessage = userGroupCatalogMessage(
		searchQuery,
		availableGroups.length,
		selectedDirectoryGroupMatchCount(groups, value.groupIds, searchQuery),
	)

	function roleFor(groupId: string): DirectoryGroupMemberRole {
		const group = groups.find((entry) => entry.id === groupId)
		if(!group) return directoryGroupMemberRoles.member
		return directoryGroupRoleForUser(value.email, group, value.groupMemberships)
	}

	function membershipsFor(
		groupIds: readonly string[],
		roleForGroup: (groupId: string) => DirectoryGroupMemberRole,
	): DirectoryUserGroupMembership[] {
		return groupIds.map((groupId) => ({ groupId, role: roleForGroup(groupId) }))
	}

	function handleAdd(groupId: string) {
		if(disabled || value.groupIds.includes(groupId)) return
		const groupIds = [...value.groupIds, groupId]
		setJustAddedGroupId(groupId)
		onChange({
			...value,
			groupIds,
			groupMemberships: membershipsFor(groupIds, (id) => (
				id === groupId ? directoryGroupMemberRoles.member : roleFor(id)
			)),
		})
	}

	function handleRemove(groupId: string) {
		if(disabled) return
		if(justAddedGroupId === groupId) setJustAddedGroupId(null)
		const groupIds = value.groupIds.filter((id) => id !== groupId)
		onChange({
			...value,
			groupIds,
			groupMemberships: membershipsFor(groupIds, roleFor),
		})
	}

	function handleRoleChange(groupId: string, role: DirectoryGroupMemberRole) {
		if(disabled) return
		onChange({
			...value,
			groupMemberships: membershipsFor(value.groupIds, (id) => (
				id === groupId ? role : roleFor(id)
			)),
		})
	}

	return (
		<Stack gap="lg">
			<SelectedUserGroups
				groups={ selectedGroups }
				justAddedGroupId={ justAddedGroupId }
				disabled={ disabled }
				onRemove={ handleRemove }
				onRoleChange={ handleRoleChange }
			/>
			<UserGroupCatalog
				query={ searchQuery }
				groups={ availableGroups }
				statusMessage={ statusMessage }
				disabled={ disabled }
				onQueryChange={ setSearchQuery }
				onAdd={ handleAdd }
			/>
		</Stack>
	)
}
