import { type TableRecordLimit } from "@gsuite/shared"
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

	const tableColumns = useMemo((): DataTableColumn<DirectoryUserRow>[] => (
		columns.map((column) => {
			const valuesForColumn = collectColumnValues(
				filterRowsExcludingColumn(users, columns, columnFilters, column.id),
				column,
			)
			const filter = columnFilters[column.id] ?? emptyColumnFilterState()
			return {
				accessor: column.id,
				title: column.label,
				sortable: true,
				textAlign: column.id === "groupCount" ? "right" : undefined,
				filtering: isColumnFilterActive(filter, valuesForColumn),
				filter: ({ close }) => (
					<ColumnValueFilter
						label={ column.label }
						values={ valuesForColumn }
						filter={ filter }
						onChange={ (nextFilter) => onColumnFilterChange(column.id, nextFilter) }
						onClose={ close }
					/>
				),
				render: (record) => {
					const value = column.getValue(record)
					return typeof value === "number" ? value : value || "—"
				},
			}
		})
	), [columns, columnFilters, onColumnFilterChange, users])

	return (
		<DataTable
			className={ clsx(classes.table) }
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
			emptyState={ sortedUsers.length === 0 ? "No users found" : undefined }
		/>
	)
}
