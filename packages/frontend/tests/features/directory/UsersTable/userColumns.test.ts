import { describe, expect, it } from "vitest"

import { toDirectoryUserRow } from "@/frontend/features/directory/UsersTable/sortDirectoryUsers"
import { userColumns } from "@/frontend/features/directory/UsersTable/userColumns"
import { defaultVisibleColumnIds } from "@/frontend/lib/tableView"
import { emptyDirectoryProfile } from "@/shared/directoryFixtures"

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

	it("includes status as an optional column", () => {
		const status = userColumns.find((column) => column.id === "accountStatus")
		const row = toDirectoryUserRow({
			...emptyDirectoryProfile(),
			email: "jane.doe@example.com",
			displayName: "Jane Doe",
			signatureHtml: "",
			groupIds: [],
			organizationalUnitPaths: ["/"],
			accountStatus: "Suspended",
		})
		expect(status?.label).toBe("Status")
		expect(status?.defaultVisible).toBe(false)
		expect(status?.getValue(row)).toBe("Suspended")
	})
})
