import { describe, expect, it } from "vitest"

import { userColumns } from "@/frontend/features/directory/UsersTable/userColumns"
import { defaultVisibleColumnIds } from "@/frontend/lib/tableView"

describe("userColumns", () => {
	it("defaults to the original six visible columns", () => {
		expect(defaultVisibleColumnIds(userColumns)).toEqual([
			"displayName",
			"email",
			"jobTitle",
			"department",
			"organizationalUnit",
			"groupCount",
		])
	})

	it("includes work phone as an optional column", () => {
		const workPhone = userColumns.find((column) => column.id === "workPhone")
		expect(workPhone?.label).toBe("Work phone")
		expect(workPhone?.defaultVisible).toBe(false)
	})
})
