import { canManageAccess } from "@gsuite/shared"
import { Container, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useNavigate } from "@tanstack/react-router"

import { Page } from "@/frontend/components/Page"
import { GroupEditor } from "@/frontend/features/directory/editor/GroupEditor"
import { useDirectoryQuery, useUpdateDirectoryGroup } from "@/frontend/queries/directory"
import { useMembershipQuery } from "@/frontend/queries/templates"

interface DirectoryGroupPageProps {
	groupId: string
}

export function DirectoryGroupPage({ groupId }: DirectoryGroupPageProps) {
	const navigate = useNavigate()
	const directory = useDirectoryQuery()
	const membership = useMembershipQuery()
	const updateGroup = useUpdateDirectoryGroup()
	const group = directory.data?.groups.find((entry) => entry.id === groupId)
	const canSave = membership.data ? canManageAccess(membership.data.role) : false

	if(directory.isError) {
		return (
			<Page title="Group">
				<Container size="md">
					<Text c="red">Error loading group: { directory.error.message }</Text>
				</Container>
			</Page>
		)
	}

	if(directory.isSuccess && !group) {
		return (
			<Page title="Group">
				<Container size="md">
					<Text c="dimmed">Group not found</Text>
				</Container>
			</Page>
		)
	}

	return (
		<Page title={ group?.name ?? "Group" }>
			<Container size="md">
				{ group
					? (
						<GroupEditor
							group={ group }
							users={ directory.data?.users ?? [] }
							canSave={ canSave }
							isSaving={ updateGroup.isPending }
							onCancel={ () => {
								void navigate({ to: "/admin/directory/groups" })
							} }
							onSave={ (update) => {
								updateGroup.mutate(update, {
									onSuccess: () => {
										notifications.show({ color: "green", message: "Group saved" })
										void navigate({ to: "/admin/directory/groups" })
									},
									onError: (error) => {
										notifications.show({ color: "red", message: error.message })
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
