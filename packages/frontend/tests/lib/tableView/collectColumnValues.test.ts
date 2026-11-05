import { describe, expect, it } from "vitest"

import { collectColumnValues } from "@/frontend/lib/tableView/collectColumnValues"
import { type TableColumnDefinition } from "@/frontend/lib/tableView/types"

interface Row {
	name: string
}

const column: TableColumnDefinition<Row> = {
	id: "name",
	label: "Name",
	defaultVisible: true,
	getValue: (row) => row.name,
}

describe("collectColumnValues", () => {
	it("returns sorted unique string values including blanks", () => {
		expect(collectColumnValues([
			{ name: "Sam" },
			{ name: "Jane" },
			{ name: "Sam" },
			{ name: "" },
		], column)).toEqual(["", "Jane", "Sam"])
	})
})
