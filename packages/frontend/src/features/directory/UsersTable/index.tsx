import { type TableRecordLimit } from "@gsuite/shared"
import { ActionIcon, Skeleton, Stack } from "@mantine/core"
import { IconPencil } from "@tabler/icons-react"
import clsx from "clsx"
import { DataTable, type DataTableColumn, type DataTableSortStatus } from "mantine-datatable"
import { useMemo, useState } from "react"

import { ColumnValueFilter } from "@/frontend/components/ColumnValueFilter"
import {
	collectColumnValues,
	type ColumnFilters,
	type ColumnFilterState,
	emptyColumnFilterState,
	filterRowsByColumnValues,
	filterRowsExcludingColumn,
	isColumnFilterActive,
	type TableColumnDefinition,
} from "@/frontend/lib/tableView"

import {
	type DirectoryUserRow,
	sortDirectoryUsers,
} from "./sortDirectoryUsers"
import * as classes from "./UsersTable.css"

interface UsersTableProps {
	users: readonly DirectoryUserRow[]
	columns: readonly TableColumnDefinition<DirectoryUserRow>[]
	columnFilters: ColumnFilters
	onColumnFilterChange: (columnId: string, filter: ColumnFilterState) => void
	recordLimit: TableRecordLimit
	loading: boolean
	canEdit: boolean
	onOpenUser: (user: DirectoryUserRow) => void
	onQuickEditUser: (user: DirectoryUserRow) => void
}

const defaultSortStatus: DataTableSortStatus<DirectoryUserRow> = {
	columnAccessor: "displayName",
	direction: "asc",
}

export function UsersTable({
	users,
	columns,
	columnFilters,
	onColumnFilterChange,
	recordLimit,
	loading,
	canEdit,
	onOpenUser,
	onQuickEditUser,
}: UsersTableProps) {
	const [sortStatus, setSortStatus] = useState<DataTableSortStatus<DirectoryUserRow>>(defaultSortStatus)
	const filteredUsers = useMemo(
		() => filterRowsByColumnValues(users, columns, columnFilters),
		[users, columns, columnFilters],
	)
	const listIdentity = `${ recordLimit }:${ sortStatus.columnAccessor }:${ sortStatus.direction }:${ JSON.stringify(columnFilters) }:${ filteredUsers.map((user) => user.email).join(",") }`
	const [pageState, setPageState] = useState({ identity: listIdentity, page: 1 })
	const page = pageState.identity === listIdentity ? pageState.page : 1

	const sortedUsers = useMemo(
		() => sortDirectoryUsers(filteredUsers, sortStatus),
		[filteredUsers, sortStatus],
	)

	const pageCount = Math.max(1, Math.ceil(sortedUsers.length / recordLimit))
	const currentPage = Math.min(page, pageCount)

	const pageRecords = useMemo(() => {
		const startIndex = (currentPage - 1) * recordLimit
		return sortedUsers.slice(startIndex, startIndex + recordLimit)
	}, [sortedUsers, currentPage, recordLimit])

	const tableColumns = useMemo((): DataTableColumn<DirectoryUserRow>[] => [
		...columns.map((column) => {
			const valuesForColumn = collectColumnValues(
				filterRowsExcludingColumn(users, columns, columnFilters, column.id),
				column,
			)
			const filter = columnFilters[column.id] ?? emptyColumnFilterState()
			return {
				accessor: column.id,
				title: column.label,
				sortable: true,
				textAlign: column.id === "groupCount" ? "right" as const : undefined,
				filtering: isColumnFilterActive(filter, valuesForColumn),
				filter: ({ close }: { close: () => void }) => (
					<ColumnValueFilter
						label={ column.label }
						values={ valuesForColumn }
						filter={ filter }
						onChange={ (nextFilter) => onColumnFilterChange(column.id, nextFilter) }
						onClose={ close }
					/>
				),
				render: (record: DirectoryUserRow) => {
					const value = column.getValue(record)
					return typeof value === "number" ? value : value || "—"
				},
			}
		}),
		{
			accessor: "actions",
			title: "Actions",
			width: 72,
			textAlign: "right",
			render: (record) => (
				<span data-row-actions="">
					<ActionIcon
						variant="subtle"
						color="harbor"
						aria-label={ `Quick edit ${ record.displayName }` }
						disabled={ !canEdit }
						onClick={ (event) => {
							event.stopPropagation()
							onQuickEditUser(record)
						} }
					>
						<IconPencil size={ 16 } />
					</ActionIcon>
				</span>
			),
		},
	], [columns, columnFilters, onColumnFilterChange, users, canEdit, onQuickEditUser])

	return (
		<DataTable
			className={ clsx(classes.table) }
			styles={ {
				root: { width: "100%" },
				table: { width: "100%", tableLayout: "fixed" },
			} }
			idAccessor="email"
			withTableBorder={ false }
			borderRadius="md"
			withColumnBorders={ false }
			withRowBorders
			highlightOnHover
			records={ pageRecords }
			totalRecords={ sortedUsers.length }
			recordsPerPage={ recordLimit }
			page={ currentPage }
			onPageChange={ (nextPage) => setPageState({ identity: listIdentity, page: nextPage }) }
			sortStatus={ sortStatus }
			onSortStatusChange={ setSortStatus }
			columns={ tableColumns }
			minHeight={ loading ? 360 : undefined }
			emptyState={ loading
				? (
					<Stack gap="sm" px="md" py="sm" w="100%" aria-label="Loading users" aria-busy="true">
						{ Array.from({ length: 8 }, (_, index) => (
							<Skeleton key={ index } height={ 22 } radius="sm" />
						)) }
					</Stack>
				)
				: sortedUsers.length === 0
					? "No users found"
					: undefined }
			pinLastColumn
			onRowClick={ ({ record, event }) => {
				const target = event.target
				if(target instanceof Element && target.closest("[data-row-actions]")) return
				onOpenUser(record)
			} }
		/>
	)
}
