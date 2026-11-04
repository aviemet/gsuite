import { describe, expect, it } from "vitest"

import { filterDirectoryOrganizationalUnits } from "@/frontend/features/directory/OrganizationalUnitsTable/filterDirectoryOrganizationalUnits"
import { type DirectoryOrganizationalUnit } from "@/shared/directoryFixtures"

const engineering: DirectoryOrganizationalUnit = {
	path: "/Engineering",
	name: "Engineering",
}

const sales: DirectoryOrganizationalUnit = {
	path: "/Sales",
	name: "Sales",
}

describe("filterDirectoryOrganizationalUnits", () => {
	it("returns all organizational units when the query is blank", () => {
		expect(filterDirectoryOrganizationalUnits([engineering, sales], "")).toEqual([
			engineering,
			sales,
		])
	})

	it("matches name and path", () => {
		expect(filterDirectoryOrganizationalUnits([engineering, sales], "engin")).toEqual([
			engineering,
		])
		expect(filterDirectoryOrganizationalUnits([engineering, sales], "/sales")).toEqual([sales])
	})
})
