import { canManageAccess, isTableRecordLimit, TABLE_RECORD_LIMITS } from "@gsuite/shared"
import { Container, Group, Select, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useNavigate } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { Page } from "@/frontend/components/Page"
import { TableColumnPicker } from "@/frontend/components/TableColumnPicker"
import { UserQuickEditModal } from "@/frontend/features/directory/editor/UserQuickEditModal"
import { UsersTable } from "@/frontend/features/directory/UsersTable"
import { toDirectoryUserRow } from "@/frontend/features/directory/UsersTable/sortDirectoryUsers"
import {
	DIRECTORY_USERS_VIEW_ID,
	userColumns,
} from "@/frontend/features/directory/UsersTable/userColumns"
import { useTableViewPreferences } from "@/frontend/hooks/useTableViewPreferences"
import { useDirectoryQuery, useUpdateDirectoryUser } from "@/frontend/queries/directory"
import { useMembershipQuery } from "@/frontend/queries/templates"

const recordLimitOptions = TABLE_RECORD_LIMITS.map((limit) => ({
	value: String(limit),
	label: `${ limit } / page`,
}))

export function DirectoryUsersPage() {
	const navigate = useNavigate()
	const { data, isLoading, error } = useDirectoryQuery()
	const membership = useMembershipQuery()
	const updateUser = useUpdateDirectoryUser()
	const [quickEditEmail, setQuickEditEmail] = useState<string | null>(null)
	const canEdit = membership.data ? canManageAccess(membership.data.role) : false
	const quickEditUser = data?.users.find((user) => user.email === quickEditEmail) ?? null
	const {
		visibleColumnIds,
		visibleColumns,
		setVisibleColumnIds,
		recordLimit,
		setRecordLimit,
		columnFilters,
		setColumnFilter,
		columns,
	} = useTableViewPreferences(DIRECTORY_USERS_VIEW_ID, userColumns)

	const rows = useMemo(
		() => (data?.users ?? []).map(toDirectoryUserRow),
		[data?.users],
	)

	if(error) {
		return (
			<Page title="Users">
				<Container size="xl">
					<Text c="red">Error loading users: { error.message }</Text>
				</Container>
			</Page>
		)
	}

	return (
		<Page title="Users">
			<Container size="xl">
				<Group mb="md" justify="space-between">
					<Select
						aria-label="Rows per page"
						data={ recordLimitOptions }
						value={ String(recordLimit) }
						onChange={ (value) => {
							const nextLimit = Number(value)
							if(isTableRecordLimit(nextLimit)) setRecordLimit(nextLimit)
						} }
						allowDeselect={ false }
						w={ 140 }
					/>
					<TableColumnPicker
						columns={ columns }
						visibleColumnIds={ visibleColumnIds }
						onChange={ setVisibleColumnIds }
					/>
				</Group>
				{ !isLoading && rows.length === 0
					? (
						<Text c="dimmed">No users found</Text>
					)
					: (
						<UsersTable
							users={ rows }
							columns={ visibleColumns }
							columnFilters={ columnFilters }
							onColumnFilterChange={ setColumnFilter }
							recordLimit={ recordLimit }
							canEdit={ canEdit }
							onOpenUser={ (user) => {
								void navigate({
									to: "/admin/directory/users/$email",
									params: { email: user.email },
								})
							} }
							onQuickEditUser={ (user) => setQuickEditEmail(user.email) }
						/>
					) }
				{ quickEditUser
					? (
						<UserQuickEditModal
							user={ quickEditUser }
							groups={ data?.groups ?? [] }
							organizationalUnits={ data?.organizationalUnits ?? [] }
							opened
							canSave={ canEdit }
							isSaving={ updateUser.isPending }
							onClose={ () => setQuickEditEmail(null) }
							onSave={ (update) => {
								updateUser.mutate(update, {
									onSuccess: () => {
										notifications.show({ color: "green", message: "User saved" })
										setQuickEditEmail(null)
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
