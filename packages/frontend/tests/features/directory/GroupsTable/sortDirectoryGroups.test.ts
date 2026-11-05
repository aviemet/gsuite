import { describe, expect, it } from "vitest"

import { type DirectoryGroupRow } from "@/frontend/features/directory/GroupsTable/groupMemberCounts"
import { sortDirectoryGroups } from "@/frontend/features/directory/GroupsTable/sortDirectoryGroups"

const engineering: DirectoryGroupRow = {
	id: "engineering",
	name: "Engineering",
	email: "engineering@example.com",
	description: "",
	members: [],
	memberCount: 3,
}

const sales: DirectoryGroupRow = {
	id: "sales",
	name: "Sales",
	email: "sales@example.com",
	description: "",
	members: [],
	memberCount: 1,
}

describe("sortDirectoryGroups", () => {
	it("sorts by name ascending and descending", () => {
		expect(sortDirectoryGroups([sales, engineering], {
			columnAccessor: "name",
			direction: "asc",
		}).map((row) => row.id)).toEqual(["engineering", "sales"])

		expect(sortDirectoryGroups([engineering, sales], {
			columnAccessor: "name",
			direction: "desc",
		}).map((row) => row.id)).toEqual(["sales", "engineering"])
	})

	it("sorts by memberCount", () => {
		expect(sortDirectoryGroups([engineering, sales], {
			columnAccessor: "memberCount",
			direction: "asc",
		}).map((row) => row.id)).toEqual(["sales", "engineering"])
	})
})
