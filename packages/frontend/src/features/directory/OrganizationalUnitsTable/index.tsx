import clsx from "clsx"
import { DataTable, type DataTableSortStatus } from "mantine-datatable"
import { useMemo, useState } from "react"

import {
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
} from "@/shared/directoryFixtures"

import * as classes from "./OrganizationalUnitsTable.css"
import {
	type DirectoryOrganizationalUnitRow,
	toDirectoryOrganizationalUnitRows,
} from "./organizationalUnitUserCounts"
import { sortDirectoryOrganizationalUnits } from "./sortDirectoryOrganizationalUnits"

interface OrganizationalUnitsTableProps {
	organizationalUnits: readonly DirectoryOrganizationalUnit[]
	users: readonly DirectoryUser[]
}

const defaultSortStatus: DataTableSortStatus<DirectoryOrganizationalUnitRow> = {
	columnAccessor: "path",
	direction: "asc",
}

export function OrganizationalUnitsTable({
	organizationalUnits,
	users,
}: OrganizationalUnitsTableProps) {
	const [sortStatus, setSortStatus] = useState<DataTableSortStatus<DirectoryOrganizationalUnitRow>>(
		defaultSortStatus,
	)

	const rows = useMemo(
		() => sortDirectoryOrganizationalUnits(
			toDirectoryOrganizationalUnitRows(organizationalUnits, users),
			sortStatus,
		),
		[organizationalUnits, users, sortStatus],
	)

	return (
		<DataTable
			className={ clsx(classes.table) }
			idAccessor="path"
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
					accessor: "path",
					title: "Path",
					sortable: true,
				},
				{
					accessor: "userCount",
					title: "Users",
					sortable: true,
					textAlign: "right",
				},
			] }
		/>
	)
}
