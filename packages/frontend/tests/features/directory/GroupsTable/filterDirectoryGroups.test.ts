import { describe, expect, it } from "vitest"

import { filterDirectoryGroups } from "@/frontend/features/directory/GroupsTable/filterDirectoryGroups"
import { type DirectoryGroup } from "@/shared/directoryFixtures"

const engineering: DirectoryGroup = {
	id: "engineering",
	name: "Engineering",
	email: "engineering@example.com",
}

const sales: DirectoryGroup = {
	id: "sales",
	name: "Sales",
	email: "sales@example.com",
}

describe("filterDirectoryGroups", () => {
	it("returns all groups when the query is blank", () => {
		expect(filterDirectoryGroups([engineering, sales], "")).toEqual([engineering, sales])
	})

	it("matches name and email", () => {
		expect(filterDirectoryGroups([engineering, sales], "engin")).toEqual([engineering])
		expect(filterDirectoryGroups([engineering, sales], "sales@example")).toEqual([sales])
	})
})
