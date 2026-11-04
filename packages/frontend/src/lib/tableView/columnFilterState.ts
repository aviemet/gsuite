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
