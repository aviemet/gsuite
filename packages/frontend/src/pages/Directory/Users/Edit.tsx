import { canManageAccess } from "@gsuite/shared"
import { Container, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useNavigate } from "@tanstack/react-router"

import { Page } from "@/frontend/components/Page"
import { UserEditor } from "@/frontend/features/directory/editor/UserEditor"
import { useCompanyQuery } from "@/frontend/queries/company"
import { useDirectoryQuery, useUpdateDirectoryUser } from "@/frontend/queries/directory"
import { useMembershipQuery } from "@/frontend/queries/templates"
import { companyDepartmentNames } from "@/shared/company"

interface DirectoryUserPageProps {
	email: string
}

export function DirectoryUserPage({ email }: DirectoryUserPageProps) {
	const navigate = useNavigate()
	const directory = useDirectoryQuery()
	const company = useCompanyQuery()
	const membership = useMembershipQuery()
	const updateUser = useUpdateDirectoryUser()
	const user = directory.data?.users.find((entry) => entry.email === email)
	const canSave = membership.data ? canManageAccess(membership.data.role) : false
	const departments = company.isPending
		? undefined
		: companyDepartmentNames(company.data?.departments ?? [])

	if(directory.isError) {
		return (
			<Page title="User">
				<Container size="md">
					<Text c="red">Error loading user: { directory.error.message }</Text>
				</Container>
			</Page>
		)
	}

	if(directory.isSuccess && !user) {
		return (
			<Page title="User">
				<Container size="md">
					<Text c="dimmed">User not found</Text>
				</Container>
			</Page>
		)
	}

	return (
		<Page title={ user?.displayName ?? "User" }>
			<Container size="md">
				{ user
					? (
						<UserEditor
							user={ user }
							groups={ directory.data?.groups ?? [] }
							organizationalUnits={ directory.data?.organizationalUnits ?? [] }
							departments={ departments }
							canSave={ canSave }
							isSaving={ updateUser.isPending }
							onCancel={ () => {
								void navigate({ to: "/admin/directory/users" })
							} }
							onSave={ (update) => {
								updateUser.mutate(update, {
									onSuccess: () => {
										notifications.show({ color: "green", message: "User saved" })
										void navigate({ to: "/admin/directory/users" })
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
