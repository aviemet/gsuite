import { type TableRecordLimit } from "@gsuite/shared"
import { useCallback, useMemo, useState } from "react"

import {
	type ColumnFilterState,
	columnFiltersWithChange,
	defaultVisibleColumnIds,
	emptyColumnFilterState,
	normalizeVisibleColumnIds,
	readSessionColumnFilters,
	resolveRecordLimit,
	resolveVisibleColumns,
	type TableColumnDefinition,
	writeSessionColumnFilters,
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
	const [filterState, setFilterState] = useState(() => ({
		viewId,
		filters: readSessionColumnFilters(viewId),
	}))
	const columnFilters = filterState.viewId === viewId
		? filterState.filters
		: readSessionColumnFilters(viewId)

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
		setFilterState((current) => {
			const currentFilters = current.viewId === viewId
				? current.filters
				: readSessionColumnFilters(viewId)
			const filters = columnFiltersWithChange(currentFilters, columnId, filter)
			writeSessionColumnFilters(viewId, filters)
			return { viewId, filters }
		})
	}, [viewId])

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
