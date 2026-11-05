import { type DataTableSortStatus } from "mantine-datatable"

import { type DirectoryGroupRow } from "./groupMemberCounts"

type SortableAccessor = "name" | "email" | "memberCount"

function isSortableAccessor(
	accessor: DataTableSortStatus<DirectoryGroupRow>["columnAccessor"],
): accessor is SortableAccessor {
	return accessor === "name" || accessor === "email" || accessor === "memberCount"
}

export function sortDirectoryGroups(
	groups: readonly DirectoryGroupRow[],
	sortStatus: DataTableSortStatus<DirectoryGroupRow>,
): DirectoryGroupRow[] {
	if(!isSortableAccessor(sortStatus.columnAccessor)) {
		return [...groups]
	}

	const sortableAccessor = sortStatus.columnAccessor
	const direction = sortStatus.direction === "desc" ? -1 : 1
	return [...groups].sort((left, right) => (
		compareDirectoryGroups(left, right, sortableAccessor) * direction
	))
}

function compareDirectoryGroups(
	left: DirectoryGroupRow,
	right: DirectoryGroupRow,
	accessor: SortableAccessor,
): number {
	if(accessor === "memberCount") {
		return left.memberCount - right.memberCount
	}

	return left[accessor].localeCompare(right[accessor])
}
