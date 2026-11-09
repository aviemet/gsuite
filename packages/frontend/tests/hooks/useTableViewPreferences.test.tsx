import { act, cleanup, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/frontend/queries/userSettings", () => ({
	useUserSettingsQuery: () => ({ data: undefined, isLoading: false }),
	useSaveTableViewPreferencesMutation: () => ({ mutate: vi.fn(), isPending: false }),
}))

import { useTableViewPreferences } from "@/frontend/hooks/useTableViewPreferences"
import { type TableColumnDefinition } from "@/frontend/lib/tableView"

const columns: TableColumnDefinition<{ department: string }>[] = [{
	id: "department",
	label: "Department",
	defaultVisible: true,
	getValue: (row) => row.department,
}]

describe("useTableViewPreferences", () => {
	beforeEach(() => {
		sessionStorage.clear()
		cleanup()
	})

	it("restores column filters after the table unmounts", () => {
		const first = renderHook(() => useTableViewPreferences("directory.users", columns))
		act(() => {
			first.result.current.setColumnFilter("department", {
				query: "eng",
				selectedValues: ["Engineering"],
			})
		})
		first.unmount()

		const second = renderHook(() => useTableViewPreferences("directory.users", columns))
		expect(second.result.current.columnFilters).toEqual({
			department: { query: "eng", selectedValues: ["Engineering"] },
		})
	})

	it("clears every column filter for the view", () => {
		const view = renderHook(() => useTableViewPreferences("directory.users", columns))
		act(() => {
			view.result.current.setColumnFilter("department", {
				query: "eng",
				selectedValues: ["Engineering"],
			})
		})

		act(() => {
			view.result.current.clearColumnFilters()
		})

		expect(view.result.current.columnFilters).toEqual({})
		expect(sessionStorage.getItem("suiteocean.tableFilters.directory.users")).toBeNull()
	})
})
