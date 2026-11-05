import { type DataTableSortStatus } from "mantine-datatable"

import { type DirectoryOrganizationalUnitRow } from "./organizationalUnitUserCounts"

type SortableAccessor = "name" | "path" | "userCount"

function isSortableAccessor(
	accessor: DataTableSortStatus<DirectoryOrganizationalUnitRow>["columnAccessor"],
): accessor is SortableAccessor {
	return accessor === "name" || accessor === "path" || accessor === "userCount"
}

export function sortDirectoryOrganizationalUnits(
	organizationalUnits: readonly DirectoryOrganizationalUnitRow[],
	sortStatus: DataTableSortStatus<DirectoryOrganizationalUnitRow>,
): DirectoryOrganizationalUnitRow[] {
	if(!isSortableAccessor(sortStatus.columnAccessor)) {
		return [...organizationalUnits]
	}

	const sortableAccessor = sortStatus.columnAccessor
	const direction = sortStatus.direction === "desc" ? -1 : 1
	return [...organizationalUnits].sort((left, right) => (
		compareDirectoryOrganizationalUnits(left, right, sortableAccessor) * direction
	))
}

function compareDirectoryOrganizationalUnits(
	left: DirectoryOrganizationalUnitRow,
	right: DirectoryOrganizationalUnitRow,
	accessor: SortableAccessor,
): number {
	if(accessor === "userCount") {
		return left.userCount - right.userCount
	}

	return left[accessor].localeCompare(right[accessor])
}
