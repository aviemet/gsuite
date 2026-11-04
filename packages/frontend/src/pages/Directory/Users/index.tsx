import { isTableRecordLimit, TABLE_RECORD_LIMITS } from "@gsuite/shared"
import { Container, Group, Select, Text } from "@mantine/core"
import { useMemo } from "react"

import { Page } from "@/frontend/components/Page"
import { TableColumnPicker } from "@/frontend/components/TableColumnPicker"
import { UsersTable } from "@/frontend/features/directory/UsersTable"
import { toDirectoryUserRow } from "@/frontend/features/directory/UsersTable/sortDirectoryUsers"
import {
	DIRECTORY_USERS_VIEW_ID,
	userColumns,
} from "@/frontend/features/directory/UsersTable/userColumns"
import { useTableViewPreferences } from "@/frontend/hooks/useTableViewPreferences"
import { useDirectoryQuery } from "@/frontend/queries/directory"

const recordLimitOptions = TABLE_RECORD_LIMITS.map((limit) => ({
	value: String(limit),
	label: `${ limit } / page`,
}))

export function DirectoryUsersPage() {
	const { data, isLoading, error } = useDirectoryQuery()
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
						/>
					) }
			</Container>
		</Page>
	)
}
