import { type ColumnFilters } from "./columnFilterState"
import { type TableColumnDefinition } from "./types"

export function filterRowsByColumnValues<TRow>(
	rows: readonly TRow[],
	columns: readonly TableColumnDefinition<TRow>[],
	filters: ColumnFilters,
): TRow[] {
	const activeFilters = columns.flatMap((column) => {
		const filter = filters[column.id]
		if(!filter) return []
		const query = filter.query.trim().toLowerCase()
		const hasQuery = query.length > 0
		const hasSelectedValues = filter.selectedValues !== null
		if(!hasQuery && !hasSelectedValues) return []
		return [{ column, query, selectedValues: filter.selectedValues }]
	})

	if(activeFilters.length === 0) return [...rows]

	return rows.filter((row) => (
		activeFilters.every(({ column, query, selectedValues }) => {
			const cellValue = String(column.getValue(row))
			if(selectedValues !== null && !selectedValues.includes(cellValue)) return false
			if(query.length > 0 && !cellValue.toLowerCase().includes(query)) return false
			return true
		})
	))
}

export function filterRowsExcludingColumn<TRow>(
	rows: readonly TRow[],
	columns: readonly TableColumnDefinition<TRow>[],
	filters: ColumnFilters,
	excludedColumnId: string,
): TRow[] {
	const remainingColumns = columns.filter((column) => column.id !== excludedColumnId)
	return filterRowsByColumnValues(rows, remainingColumns, filters)
}
