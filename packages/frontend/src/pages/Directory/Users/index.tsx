import { canManageAccess } from "@gsuite/shared"
import { Button, Container, Group, Text, TextInput } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconSearch } from "@tabler/icons-react"
import { useNavigate } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { Page } from "@/frontend/components/Page"
import { TableColumnPicker } from "@/frontend/components/TableColumnPicker"
import { UserQuickEditModal } from "@/frontend/features/directory/editor/UserQuickEditModal"
import {
	defaultDirectoryUserSortStatus,
	isDefaultDirectoryUserSort,
	UsersTable,
} from "@/frontend/features/directory/UsersTable"
import { toDirectoryUserRow } from "@/frontend/features/directory/UsersTable/sortDirectoryUsers"
import {
	DIRECTORY_USERS_VIEW_ID,
	userColumns,
} from "@/frontend/features/directory/UsersTable/userColumns"
import { useTableViewPreferences } from "@/frontend/hooks/useTableViewPreferences"
import { filterRowsBySearch } from "@/frontend/lib/tableView"
import { useCompanyQuery } from "@/frontend/queries/company"
import { useDirectoryQuery, useUpdateDirectoryUser } from "@/frontend/queries/directory"
import { useMembershipQuery } from "@/frontend/queries/templates"
import { companyDepartmentNames } from "@/shared/company"

export function DirectoryUsersPage() {
	const navigate = useNavigate()
	const { data, isLoading, error } = useDirectoryQuery()
	const company = useCompanyQuery()
	const membership = useMembershipQuery()
	const updateUser = useUpdateDirectoryUser()
	const [quickEditEmail, setQuickEditEmail] = useState<string | null>(null)
	const canEdit = membership.data ? canManageAccess(membership.data.role) : false
	const departments = company.isPending
		? undefined
		: companyDepartmentNames(company.data?.departments ?? [])
	const quickEditUser = data?.users.find((user) => user.email === quickEditEmail) ?? null
	const {
		visibleColumnIds,
		visibleColumns,
		setVisibleColumnIds,
		recordLimit,
		setRecordLimit,
		columnFilters,
		setColumnFilter,
		clearColumnFilters,
		columns,
	} = useTableViewPreferences(DIRECTORY_USERS_VIEW_ID, userColumns)
	const [sortStatus, setSortStatus] = useState(defaultDirectoryUserSortStatus)
	const [searchQuery, setSearchQuery] = useState("")
	const hasTableViewOverrides = searchQuery.trim().length > 0
		|| Object.keys(columnFilters).length > 0
		|| !isDefaultDirectoryUserSort(sortStatus)

	const rows = useMemo(
		() => (data?.users ?? []).map(toDirectoryUserRow),
		[data?.users],
	)
	const searchedRows = useMemo(
		() => filterRowsBySearch(rows, columns, searchQuery),
		[rows, columns, searchQuery],
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
					<TextInput
						aria-label="Search users"
						placeholder="Search users"
						leftSection={ <IconSearch size={ 16 } /> }
						value={ searchQuery }
						onChange={ (event) => setSearchQuery(event.currentTarget.value) }
					/>
					<Group>
						<Button
							variant="subtle"
							disabled={ !hasTableViewOverrides }
							onClick={ () => {
								setSearchQuery("")
								clearColumnFilters()
								setSortStatus(defaultDirectoryUserSortStatus)
							} }
						>
							Clear all
						</Button>
						<TableColumnPicker
							columns={ columns }
							visibleColumnIds={ visibleColumnIds }
							onChange={ setVisibleColumnIds }
						/>
					</Group>
				</Group>
				{ !isLoading && rows.length === 0
					? (
						<Text c="dimmed">No users found</Text>
					)
					: (
						<UsersTable
							users={ searchedRows }
							columns={ visibleColumns }
							columnFilters={ columnFilters }
							onColumnFilterChange={ setColumnFilter }
							recordLimit={ recordLimit }
							onRecordLimitChange={ setRecordLimit }
							loading={ isLoading }
							sortStatus={ sortStatus }
							onSortStatusChange={ setSortStatus }
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
							departments={ departments }
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
