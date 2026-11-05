import { describe, expect, it } from "vitest"

import { toDirectoryGroupRows } from "@/frontend/features/directory/GroupsTable/groupMemberCounts"
import { type DirectoryGroup, type DirectoryUser, emptyDirectoryProfile } from "@/shared/directoryFixtures"

function user(groupIds: string[]): DirectoryUser {
	return {
		...emptyDirectoryProfile(),
		email: `${ groupIds.join("-") }@example.com`,
		displayName: "User",
		signatureHtml: "",
		groupIds,
		organizationalUnitPaths: [],
	}
}

const groups: DirectoryGroup[] = [
	{
		id: "engineering",
		name: "Engineering",
		email: "engineering@example.com",
		description: "",
		members: [],
	},
	{
		id: "sales",
		name: "Sales",
		email: "sales@example.com",
		description: "",
		members: [],
	},
]

describe("toDirectoryGroupRows", () => {
	it("counts users that belong to each group", () => {
		expect(toDirectoryGroupRows(groups, [
			user(["engineering"]),
			user(["engineering", "sales"]),
			user(["sales"]),
		])).toEqual([
			{ id: "engineering", name: "Engineering", email: "engineering@example.com", description: "", members: [], memberCount: 2 },
			{ id: "sales", name: "Sales", email: "sales@example.com", description: "", members: [], memberCount: 2 },
		])
	})

	it("returns zero when a group has no members", () => {
		expect(toDirectoryGroupRows(groups, [])).toEqual([
			{ id: "engineering", name: "Engineering", email: "engineering@example.com", description: "", members: [], memberCount: 0 },
			{ id: "sales", name: "Sales", email: "sales@example.com", description: "", members: [], memberCount: 0 },
		])
	})
})
