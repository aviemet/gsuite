import { type TableColumnDefinition } from "./types"

export function filterRowsBySearch<TRow>(
	rows: readonly TRow[],
	columns: readonly TableColumnDefinition<TRow>[],
	searchQuery: string,
): TRow[] {
	const normalizedQuery = searchQuery.trim().toLowerCase()
	if(normalizedQuery.length === 0) return [...rows]

	return rows.filter((row) => (
		columns.some((column) => (
			String(column.getValue(row)).toLowerCase().includes(normalizedQuery)
		))
	))
}
