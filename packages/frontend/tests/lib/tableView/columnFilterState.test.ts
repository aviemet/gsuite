import { describe, expect, it } from "vitest"

import {
	columnFiltersWithChange,
	formatColumnFilterValue,
	isColumnFilterActive,
} from "@/frontend/lib/tableView/columnFilterState"

describe("isColumnFilterActive", () => {
	it("is inactive when query is blank and all values are selected", () => {
		expect(isColumnFilterActive({
			query: "",
			selectedValues: null,
		}, ["a", "b"])).toBe(false)
	})

	it("is active for a query or a subset of values", () => {
		expect(isColumnFilterActive({
			query: "a",
			selectedValues: null,
		}, ["a", "b"])).toBe(true)

		expect(isColumnFilterActive({
			query: "",
			selectedValues: ["a"],
		}, ["a", "b"])).toBe(true)
	})
})

describe("columnFiltersWithChange", () => {
	it("keeps a filter and drops it when the column is cleared", () => {
		const withDepartment = columnFiltersWithChange({}, "department", {
			query: "eng",
			selectedValues: ["Engineering"],
		})
		expect(withDepartment).toEqual({
			department: { query: "eng", selectedValues: ["Engineering"] },
		})

		expect(columnFiltersWithChange(withDepartment, "department", {
			query: "  ",
			selectedValues: null,
		})).toEqual({})
	})
})

describe("formatColumnFilterValue", () => {
	it("labels blank values", () => {
		expect(formatColumnFilterValue("")).toBe("(Blank)")
		expect(formatColumnFilterValue("Engineering")).toBe("Engineering")
	})
})
