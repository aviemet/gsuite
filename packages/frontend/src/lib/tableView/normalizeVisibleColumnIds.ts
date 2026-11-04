import { type TableColumnDefinition } from "./types"

export function defaultVisibleColumnIds<TRow>(
	columns: readonly TableColumnDefinition<TRow>[],
): string[] {
	return columns.filter((column) => column.defaultVisible).map((column) => column.id)
}

export function normalizeVisibleColumnIds<TRow>(
	columns: readonly TableColumnDefinition<TRow>[],
	savedColumnIds: readonly string[] | undefined,
): string[] {
	const knownIds = new Set(columns.map((column) => column.id))
	const defaults = defaultVisibleColumnIds(columns)
	if(!savedColumnIds || savedColumnIds.length === 0) return defaults

	const normalized = columns
		.map((column) => column.id)
		.filter((columnId) => savedColumnIds.includes(columnId) && knownIds.has(columnId))

	if(normalized.length === 0) return defaults
	return normalized
}

export function resolveVisibleColumns<TRow>(
	columns: readonly TableColumnDefinition<TRow>[],
	visibleColumnIds: readonly string[],
): TableColumnDefinition<TRow>[] {
	const columnsById = new Map<string, TableColumnDefinition<TRow>>(
		columns.map((column) => [column.id, column]),
	)
	return visibleColumnIds.flatMap((columnId) => {
		const column = columnsById.get(columnId)
		return column ? [column] : []
	})
}
