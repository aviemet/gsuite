import { describe, expect, it } from "vitest"

import {
	defaultVisibleColumnIds,
	normalizeVisibleColumnIds,
	resolveVisibleColumns,
} from "@/frontend/lib/tableView/normalizeVisibleColumnIds"
import { type TableColumnDefinition } from "@/frontend/lib/tableView/types"

interface Row {
	name: string
	email: string
	title: string
}

const columns: TableColumnDefinition<Row>[] = [
	{ id: "name", label: "Name", defaultVisible: true, getValue: (row) => row.name },
	{ id: "email", label: "Email", defaultVisible: true, getValue: (row) => row.email },
	{ id: "title", label: "Title", defaultVisible: false, getValue: (row) => row.title },
]

describe("normalizeVisibleColumnIds", () => {
	it("returns default visible ids when saved ids are missing or empty", () => {
		expect(defaultVisibleColumnIds(columns)).toEqual(["name", "email"])
		expect(normalizeVisibleColumnIds(columns, undefined)).toEqual(["name", "email"])
		expect(normalizeVisibleColumnIds(columns, [])).toEqual(["name", "email"])
	})

	it("keeps known ids in registry order and drops unknown ids", () => {
		expect(normalizeVisibleColumnIds(columns, ["title", "unknown", "name"])).toEqual([
			"name",
			"title",
		])
	})

	it("falls back to defaults when no known ids remain", () => {
		expect(normalizeVisibleColumnIds(columns, ["unknown"])).toEqual(["name", "email"])
	})
})

describe("resolveVisibleColumns", () => {
	it("returns column definitions for the visible ids", () => {
		expect(resolveVisibleColumns(columns, ["email", "title"]).map((column) => column.id)).toEqual([
			"email",
			"title",
		])
	})
})
