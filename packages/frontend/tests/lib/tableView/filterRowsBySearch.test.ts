import { describe, expect, it } from "vitest"

import { filterRowsBySearch } from "@/frontend/lib/tableView/filterRowsBySearch"
import { type TableColumnDefinition } from "@/frontend/lib/tableView/types"

interface Row {
	name: string
	email: string
}

const columns: TableColumnDefinition<Row>[] = [
	{ id: "name", label: "Name", defaultVisible: true, getValue: (row) => row.name },
	{ id: "email", label: "Email", defaultVisible: true, getValue: (row) => row.email },
]

const rows: Row[] = [
	{ name: "Jane Doe", email: "jane@example.com" },
	{ name: "Sam Lee", email: "sam@example.com" },
]

describe("filterRowsBySearch", () => {
	it("returns every row when the query is blank", () => {
		expect(filterRowsBySearch(rows, columns, "   ")).toEqual(rows)
	})

	it("matches any column, ignoring case and surrounding spaces", () => {
		expect(filterRowsBySearch(rows, columns, "  JANE@ ")).toEqual([rows[0]])
	})

	it("returns no rows when nothing matches", () => {
		expect(filterRowsBySearch(rows, columns, "morgan")).toEqual([])
	})
})
