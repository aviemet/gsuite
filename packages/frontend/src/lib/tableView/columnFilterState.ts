export interface ColumnFilterState {
	query: string
	selectedValues: string[] | null
}

export type ColumnFilters = Record<string, ColumnFilterState>

export function emptyColumnFilterState(): ColumnFilterState {
	return {
		query: "",
		selectedValues: null,
	}
}

export function columnFiltersWithChange(
	filters: ColumnFilters,
	columnId: string,
	filter: ColumnFilterState,
): ColumnFilters {
	const isEmpty = filter.query.trim().length === 0 && filter.selectedValues === null
	if(!isEmpty) {
		return {
			...filters,
			[columnId]: filter,
		}
	}

	const remainingFilters: ColumnFilters = {}
	for(const [filterColumnId, filterValue] of Object.entries(filters)) {
		if(filterColumnId !== columnId) remainingFilters[filterColumnId] = filterValue
	}
	return remainingFilters
}

export function isColumnFilterActive(
	filter: ColumnFilterState | undefined,
	allValues: readonly string[],
): boolean {
	if(!filter) return false
	if(filter.query.trim().length > 0) return true
	if(filter.selectedValues === null) return false
	if(filter.selectedValues.length !== allValues.length) return true
	return !allValues.every((value) => filter.selectedValues?.includes(value))
}

export function formatColumnFilterValue(value: string): string {
	return value.length === 0 ? "(Blank)" : value
}
