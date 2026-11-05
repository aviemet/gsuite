import { describe, expect, it } from "vitest"

import { filterRowsByColumnValues } from "@/frontend/lib/tableView/filterRowsByColumnValues"
import { type TableColumnDefinition } from "@/frontend/lib/tableView/types"

interface Row {
	name: string
	email: string
	count: number
}

const columns: TableColumnDefinition<Row>[] = [
	{ id: "name", label: "Name", defaultVisible: true, getValue: (row) => row.name },
	{ id: "email", label: "Email", defaultVisible: true, getValue: (row) => row.email },
	{ id: "count", label: "Count", defaultVisible: true, getValue: (row) => row.count },
]

const rows: Row[] = [
	{ name: "Jane Doe", email: "jane@example.com", count: 2 },
	{ name: "Sam Lee", email: "sam@example.com", count: 5 },
	{ name: "", email: "blank@example.com", count: 0 },
]

describe("filterRowsByColumnValues", () => {
	it("returns all rows when filters are inactive", () => {
		expect(filterRowsByColumnValues(rows, columns, {
			name: { query: "  ", selectedValues: null },
		})).toEqual(rows)
	})

	it("applies case-insensitive contains filters across columns", () => {
		expect(filterRowsByColumnValues(rows, columns, {
			name: { query: "jane", selectedValues: null },
			email: { query: "EXAMPLE", selectedValues: null },
		})).toEqual([rows[0]])
	})

	it("filters by selected distinct values", () => {
		expect(filterRowsByColumnValues(rows, columns, {
			name: { query: "", selectedValues: ["Sam Lee", ""] },
		})).toEqual([rows[1], rows[2]])
	})

	it("requires both query and selected values when both are set", () => {
		expect(filterRowsByColumnValues(rows, columns, {
			name: { query: "sam", selectedValues: ["Jane Doe", "Sam Lee"] },
		})).toEqual([rows[1]])
	})

	it("filters numeric values as strings", () => {
		expect(filterRowsByColumnValues(rows, columns, {
			count: { query: "5", selectedValues: null },
		})).toEqual([rows[1]])
	})
})
