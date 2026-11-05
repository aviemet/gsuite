import { canManageAccess } from "@gsuite/shared"
import { Container, Group, Text, TextInput } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconSearch } from "@tabler/icons-react"
import { useNavigate } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { Page } from "@/frontend/components/Page"
import { GroupQuickEditModal } from "@/frontend/features/directory/editor/GroupQuickEditModal"
import { GroupsTable } from "@/frontend/features/directory/GroupsTable"
import { filterDirectoryGroups } from "@/frontend/features/directory/GroupsTable/filterDirectoryGroups"
import { useDirectoryQuery, useUpdateDirectoryGroup } from "@/frontend/queries/directory"
import { useMembershipQuery } from "@/frontend/queries/templates"

export function DirectoryGroupsPage() {
	const navigate = useNavigate()
	const { data, isLoading, error } = useDirectoryQuery()
	const membership = useMembershipQuery()
	const updateGroup = useUpdateDirectoryGroup()
	const [searchQuery, setSearchQuery] = useState("")
	const [quickEditGroupId, setQuickEditGroupId] = useState<string | null>(null)
	const canEdit = membership.data ? canManageAccess(membership.data.role) : false
	const quickEditGroup = data?.groups.find((group) => group.id === quickEditGroupId) ?? null

	const filteredGroups = useMemo(
		() => filterDirectoryGroups(data?.groups ?? [], searchQuery),
		[data?.groups, searchQuery],
	)

	if(error) {
		return (
			<Page title="Groups">
				<Container size="xl">
					<Text c="red">Error loading groups: { error.message }</Text>
				</Container>
			</Page>
		)
	}

	return (
		<Page title="Groups">
			<Container size="xl">
				<Group mb="md">
					<TextInput
						aria-label="Search groups"
						placeholder="Search groups"
						leftSection={ <IconSearch size={ 16 } /> }
						value={ searchQuery }
						onChange={ (event) => setSearchQuery(event.currentTarget.value) }
					/>
				</Group>
				{ !isLoading && filteredGroups.length === 0
					? (
						<Text c="dimmed">No groups found</Text>
					)
					: (
						<GroupsTable
							groups={ filteredGroups }
							users={ data?.users ?? [] }
							canEdit={ canEdit }
							onOpenGroup={ (group) => {
								void navigate({
									to: "/admin/directory/groups/$groupId",
									params: { groupId: group.id },
								})
							} }
							onQuickEditGroup={ (group) => setQuickEditGroupId(group.id) }
						/>
					) }
				{ quickEditGroup
					? (
						<GroupQuickEditModal
							group={ quickEditGroup }
							users={ data?.users ?? [] }
							opened
							canSave={ canEdit }
							isSaving={ updateGroup.isPending }
							onClose={ () => setQuickEditGroupId(null) }
							onSave={ (update) => {
								updateGroup.mutate(update, {
									onSuccess: () => {
										notifications.show({ color: "green", message: "Group saved" })
										setQuickEditGroupId(null)
									},
									onError: (saveError) => {
										notifications.show({ color: "red", message: saveError.message })
									},
								})
							} }
						/>
					)
					: null }
			</Container>
		</Page>
	)
}
