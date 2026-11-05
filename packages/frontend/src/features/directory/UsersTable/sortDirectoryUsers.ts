import { type DataTableSortStatus } from "mantine-datatable"

import { type DirectoryUser } from "@/shared/directoryFixtures"

import { deepestOrganizationalUnitPath } from "./deepestOrganizationalUnitPath"

export type DirectoryUserRow = DirectoryUser & {
	organizationalUnit: string
	groupCount: number
	workPhone: string
}

const sortableAccessors = [
	"displayName",
	"email",
	"jobTitle",
	"department",
	"organizationalUnit",
	"groupCount",
	"givenName",
	"familyName",
	"organization",
	"location",
	"employeeId",
	"managerEmail",
	"workPhone",
] as const

type SortableAccessor = typeof sortableAccessors[number]

function isSortableAccessor(
	accessor: DataTableSortStatus<DirectoryUserRow>["columnAccessor"],
): accessor is SortableAccessor {
	return sortableAccessors.some((sortableAccessor) => sortableAccessor === accessor)
}

export function toDirectoryUserRow(user: DirectoryUser): DirectoryUserRow {
	return {
		...user,
		organizationalUnit: deepestOrganizationalUnitPath(user.organizationalUnitPaths),
		groupCount: user.groupIds.length,
		workPhone: user.phoneNumbers.find((phone) => phone.type === "work")?.number ?? "",
	}
}

export function sortDirectoryUsers(
	users: readonly DirectoryUserRow[],
	sortStatus: DataTableSortStatus<DirectoryUserRow>,
): DirectoryUserRow[] {
	if(!isSortableAccessor(sortStatus.columnAccessor)) {
		return [...users]
	}

	const sortableAccessor = sortStatus.columnAccessor
	const direction = sortStatus.direction === "desc" ? -1 : 1
	return [...users].sort((left, right) => (
		compareDirectoryUsers(left, right, sortableAccessor) * direction
	))
}

function compareDirectoryUsers(
	left: DirectoryUserRow,
	right: DirectoryUserRow,
	accessor: SortableAccessor,
): number {
	if(accessor === "groupCount") {
		return left.groupCount - right.groupCount
	}

	return left[accessor].localeCompare(right[accessor])
}
