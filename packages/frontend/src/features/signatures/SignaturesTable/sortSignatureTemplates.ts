import { type DataTableSortStatus } from "mantine-datatable"

import { type Template } from "@/frontend/types/firebase"

import { templateCreatedAtMillis } from "./templateCreatedAtMillis"

type SortableAccessor = "name" | "isScheduled" | "createdAt"

function isSortableAccessor(accessor: DataTableSortStatus<Template>["columnAccessor"]): accessor is SortableAccessor {
	return accessor === "name" || accessor === "isScheduled" || accessor === "createdAt"
}

export function sortSignatureTemplates(
	templates: readonly Template[],
	sortStatus: DataTableSortStatus<Template>,
): Template[] {
	if(!isSortableAccessor(sortStatus.columnAccessor)) {
		return [...templates]
	}

	const sortableAccessor = sortStatus.columnAccessor
	const direction = sortStatus.direction === "desc" ? -1 : 1
	return [...templates].sort((left, right) => (
		compareTemplates(left, right, sortableAccessor) * direction
	))
}

function compareTemplates(
	left: Template,
	right: Template,
	accessor: SortableAccessor,
): number {
	if(accessor === "name") {
		return left.name.localeCompare(right.name)
	}

	if(accessor === "createdAt") {
		return templateCreatedAtMillis(left.createdAt) - templateCreatedAtMillis(right.createdAt)
	}

	return Number(Boolean(left.isScheduled)) - Number(Boolean(right.isScheduled))
}
