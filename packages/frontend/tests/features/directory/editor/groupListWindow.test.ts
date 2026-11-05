import { describe, expect, it } from "vitest"

import { GROUP_LIST_HEIGHT, GROUP_ROW_HEIGHT, groupListWindow } from "@/frontend/features/directory/editor/groupListWindow"

describe("groupListWindow", () => {
	it("returns an empty window when there are no rows", () => {
		expect(groupListWindow(0, 0)).toEqual({ start: 0, end: 0 })
	})

	it("renders the first screen plus overscan", () => {
		const window = groupListWindow(0, 200)
		const visibleRowCount = Math.ceil(GROUP_LIST_HEIGHT / GROUP_ROW_HEIGHT)
		expect(window.start).toBe(0)
		expect(window.end).toBe(visibleRowCount + 4)
		expect(window.end).toBeLessThan(200)
	})

	it("slides the window with the scroll position", () => {
		const scrolledRows = 40
		const window = groupListWindow(scrolledRows * GROUP_ROW_HEIGHT, 200)
		expect(window.start).toBe(scrolledRows - 4)
		expect(window.end).toBeLessThan(200)
		expect(window.end - window.start).toBe(Math.ceil(GROUP_LIST_HEIGHT / GROUP_ROW_HEIGHT) + 8)
	})
})
