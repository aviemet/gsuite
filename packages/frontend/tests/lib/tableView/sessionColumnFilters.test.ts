import { beforeEach, describe, expect, it } from "vitest"

import { readSessionColumnFilters, writeSessionColumnFilters } from "@/frontend/lib/tableView/sessionColumnFilters"

const departmentFilter = {
	department: {
		query: "eng",
		selectedValues: ["Engineering"],
	},
}

describe("session column filters", () => {
	beforeEach(() => {
		sessionStorage.clear()
	})

	it("returns the filters saved for that table after they are stored", () => {
		writeSessionColumnFilters("directory.users", departmentFilter)
		expect(readSessionColumnFilters("directory.users")).toEqual(departmentFilter)
	})

	it("keeps each table's filters separate", () => {
		writeSessionColumnFilters("directory.users", departmentFilter)
		writeSessionColumnFilters("directory.groups", {
			name: { query: "sales", selectedValues: null },
		})

		expect(readSessionColumnFilters("directory.users")).toEqual(departmentFilter)
		expect(readSessionColumnFilters("directory.groups")).toEqual({
			name: { query: "sales", selectedValues: null },
		})
	})

	it("forgets the table when the last filter is cleared", () => {
		writeSessionColumnFilters("directory.users", departmentFilter)
		writeSessionColumnFilters("directory.users", {})
		expect(readSessionColumnFilters("directory.users")).toEqual({})
		expect(sessionStorage.getItem("suiteocean.tableFilters.directory.users")).toBeNull()
	})

	it("ignores stored values that are not column filters", () => {
		sessionStorage.setItem("suiteocean.tableFilters.directory.users", JSON.stringify({
			department: { query: "eng", selectedValues: ["Engineering"] },
			jobTitle: { query: 12, selectedValues: null },
			location: "San Francisco",
		}))
		sessionStorage.setItem("suiteocean.tableFilters.broken", "{")

		expect(readSessionColumnFilters("directory.users")).toEqual(departmentFilter)
		expect(readSessionColumnFilters("broken")).toEqual({})
		expect(readSessionColumnFilters("missing")).toEqual({})
	})
})
