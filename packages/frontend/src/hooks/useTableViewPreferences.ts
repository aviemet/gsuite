import { type TableRecordLimit } from "@gsuite/shared"
import { useCallback, useMemo, useState } from "react"

import {
	type ColumnFilters,
	type ColumnFilterState,
	defaultVisibleColumnIds,
	emptyColumnFilterState,
	normalizeVisibleColumnIds,
	resolveRecordLimit,
	resolveVisibleColumns,
	type TableColumnDefinition,
} from "@/frontend/lib/tableView"
import {
	useSaveTableViewPreferencesMutation,
	useUserSettingsQuery,
} from "@/frontend/queries/userSettings"

export function useTableViewPreferences<TRow>(
	viewId: string,
	columns: readonly TableColumnDefinition<TRow>[],
) {
	const settingsQuery = useUserSettingsQuery()
	const saveMutation = useSaveTableViewPreferencesMutation()
	const [columnFilters, setColumnFilters] = useState<ColumnFilters>({})

	const viewPreferences = settingsQuery.data?.tableViews[viewId]
	const defaults = useMemo(() => defaultVisibleColumnIds(columns), [columns])

	const visibleColumnIds = useMemo(
		() => normalizeVisibleColumnIds(columns, viewPreferences?.visibleColumnIds ?? defaults),
		[columns, viewPreferences?.visibleColumnIds, defaults],
	)

	const visibleColumns = useMemo(
		() => resolveVisibleColumns(columns, visibleColumnIds),
		[columns, visibleColumnIds],
	)

	const recordLimit = useMemo(
		() => resolveRecordLimit(viewPreferences, settingsQuery.data),
		[viewPreferences, settingsQuery.data],
	)

	const persistView = useCallback((nextVisibleColumnIds: string[], nextRecordLimit: TableRecordLimit) => {
		saveMutation.mutate({
			viewId,
			visibleColumnIds: nextVisibleColumnIds,
			recordLimit: nextRecordLimit,
		})
	}, [saveMutation, viewId])

	const setVisibleColumnIds = useCallback((nextVisibleColumnIds: string[]) => {
		const normalized = normalizeVisibleColumnIds(columns, nextVisibleColumnIds)
		persistView(normalized, recordLimit)
	}, [columns, persistView, recordLimit])

	const setRecordLimit = useCallback((nextRecordLimit: TableRecordLimit) => {
		persistView(visibleColumnIds, nextRecordLimit)
	}, [persistView, visibleColumnIds])

	const setColumnFilter = useCallback((columnId: string, filter: ColumnFilterState) => {
		setColumnFilters((currentFilters) => {
			const isEmpty = filter.query.trim().length === 0 && filter.selectedValues === null
			if(isEmpty) {
				const remainingFilters: ColumnFilters = {}
				for(const [filterColumnId, filterValue] of Object.entries(currentFilters)) {
					if(filterColumnId !== columnId) remainingFilters[filterColumnId] = filterValue
				}
				return remainingFilters
			}
			return {
				...currentFilters,
				[columnId]: filter,
			}
		})
	}, [])

	const clearColumnFilter = useCallback((columnId: string) => {
		setColumnFilter(columnId, emptyColumnFilterState())
	}, [setColumnFilter])

	return {
		columns,
		visibleColumnIds,
		visibleColumns,
		setVisibleColumnIds,
		recordLimit,
		setRecordLimit,
		columnFilters,
		setColumnFilter,
		clearColumnFilter,
		isLoading: settingsQuery.isLoading,
		isSaving: saveMutation.isPending,
	}
}
