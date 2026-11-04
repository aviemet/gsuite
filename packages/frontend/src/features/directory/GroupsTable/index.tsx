import clsx from "clsx"
import { DataTable, type DataTableSortStatus } from "mantine-datatable"
import { useMemo, useState } from "react"

import { type DirectoryGroup, type DirectoryUser } from "@/shared/directoryFixtures"

import { type DirectoryGroupRow, toDirectoryGroupRows } from "./groupMemberCounts"
import * as classes from "./GroupsTable.css"
import { sortDirectoryGroups } from "./sortDirectoryGroups"

interface GroupsTableProps {
	groups: readonly DirectoryGroup[]
	users: readonly DirectoryUser[]
}

const defaultSortStatus: DataTableSortStatus<DirectoryGroupRow> = {
	columnAccessor: "name",
	direction: "asc",
}

export function GroupsTable({ groups, users }: GroupsTableProps) {
	const [sortStatus, setSortStatus] = useState<DataTableSortStatus<DirectoryGroupRow>>(defaultSortStatus)

	const rows = useMemo(
		() => sortDirectoryGroups(toDirectoryGroupRows(groups, users), sortStatus),
		[groups, users, sortStatus],
	)

	return (
		<DataTable
			className={ clsx(classes.table) }
			idAccessor="id"
			withTableBorder={ false }
			borderRadius="md"
			withColumnBorders={ false }
			withRowBorders
			highlightOnHover
			records={ rows }
			sortStatus={ sortStatus }
			onSortStatusChange={ setSortStatus }
			columns={ [
				{
					accessor: "name",
					title: "Name",
					sortable: true,
				},
				{
					accessor: "email",
					title: "Email",
					sortable: true,
				},
				{
					accessor: "memberCount",
					title: "Members",
					sortable: true,
					textAlign: "right",
				},
			] }
		/>
	)
}
