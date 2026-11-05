import { ActionIcon } from "@mantine/core"
import { IconPencil } from "@tabler/icons-react"
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
	canEdit: boolean
	onOpenGroup: (group: DirectoryGroupRow) => void
	onQuickEditGroup: (group: DirectoryGroupRow) => void
}

const defaultSortStatus: DataTableSortStatus<DirectoryGroupRow> = {
	columnAccessor: "name",
	direction: "asc",
}

export function GroupsTable({
	groups,
	users,
	canEdit,
	onOpenGroup,
	onQuickEditGroup,
}: GroupsTableProps) {
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
								aria-label={ `Quick edit ${ record.name }` }
								disabled={ !canEdit }
								onClick={ (event) => {
									event.stopPropagation()
									onQuickEditGroup(record)
								} }
							>
								<IconPencil size={ 16 } />
							</ActionIcon>
						</span>
					),
				},
			] }
			pinLastColumn
			onRowClick={ ({ record, event }) => {
				const target = event.target
				if(target instanceof Element && target.closest("[data-row-actions]")) return
				onOpenGroup(record)
			} }
		/>
	)
}
