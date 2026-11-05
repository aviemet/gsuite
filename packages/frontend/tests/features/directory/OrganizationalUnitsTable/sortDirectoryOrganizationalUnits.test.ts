import { describe, expect, it } from "vitest"

import { type DirectoryOrganizationalUnitRow } from "@/frontend/features/directory/OrganizationalUnitsTable/organizationalUnitUserCounts"
import { sortDirectoryOrganizationalUnits } from "@/frontend/features/directory/OrganizationalUnitsTable/sortDirectoryOrganizationalUnits"

const engineering: DirectoryOrganizationalUnitRow = {
	path: "/Engineering",
	name: "Engineering",
	userCount: 2,
}

const sales: DirectoryOrganizationalUnitRow = {
	path: "/Sales",
	name: "Sales",
	userCount: 5,
}

describe("sortDirectoryOrganizationalUnits", () => {
	it("sorts by path ascending and descending", () => {
		expect(sortDirectoryOrganizationalUnits([sales, engineering], {
			columnAccessor: "path",
			direction: "asc",
		}).map((row) => row.path)).toEqual(["/Engineering", "/Sales"])

		expect(sortDirectoryOrganizationalUnits([engineering, sales], {
			columnAccessor: "path",
			direction: "desc",
		}).map((row) => row.path)).toEqual(["/Sales", "/Engineering"])
	})

	it("sorts by userCount", () => {
		expect(sortDirectoryOrganizationalUnits([sales, engineering], {
			columnAccessor: "userCount",
			direction: "asc",
		}).map((row) => row.path)).toEqual(["/Engineering", "/Sales"])
	})
})
