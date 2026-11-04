import { type TableColumnDefinition } from "./types"

export function collectColumnValues<TRow>(
	rows: readonly TRow[],
	column: TableColumnDefinition<TRow>,
): string[] {
	const values = new Set<string>()
	for(const row of rows) {
		values.add(String(column.getValue(row)))
	}
	return [...values].sort((left, right) => left.localeCompare(right))
}
