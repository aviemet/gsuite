import { describe, expect, it } from "vitest"

import {
	availableDirectoryGroups,
	directoryGroupRoleForUser,
	revealRowScrollTop,
	selectedDirectoryGroupMatchCount,
	selectedDirectoryGroups,
	userGroupCatalogMessage,
} from "@/frontend/features/directory/editor/userGroupMembership"
import { type DirectoryGroup, directoryGroupMemberRoles } from "@/shared/directoryFixtures"

function group(id: string, name: string, email = `${ id }@example.com`): DirectoryGroup {
	return {
		id,
		name,
		email,
		description: "",
		members: [],
	}
}

const engineering = group("engineering", "Engineering")
const sales = group("sales", "Sales")
const product = group("product", "Product")
const groups = [sales, engineering, product]

describe("selectedDirectoryGroups", () => {
	it("returns chosen groups in name order", () => {
		expect(selectedDirectoryGroups(groups, ["sales", "engineering"]).map((entry) => entry.id))
			.toEqual(["engineering", "sales"])
	})

	it("drops ids that are not in the directory", () => {
		expect(selectedDirectoryGroups(groups, ["missing", "product"]).map((entry) => entry.id))
			.toEqual(["product"])
	})
})

describe("availableDirectoryGroups", () => {
	it("omits selected groups and filters the rest", () => {
		expect(availableDirectoryGroups(groups, ["engineering"], "sal").map((entry) => entry.id))
			.toEqual(["sales"])
	})

	it("lists every unselected group when the query is empty", () => {
		expect(availableDirectoryGroups(groups, ["sales"], " ").map((entry) => entry.id))
			.toEqual(["engineering", "product"])
	})
})

describe("selectedDirectoryGroupMatchCount", () => {
	it("counts selected groups that match the query", () => {
		expect(selectedDirectoryGroupMatchCount(groups, ["engineering", "sales"], "")).toBe(0)
		expect(selectedDirectoryGroupMatchCount(groups, ["engineering", "sales"], "eng")).toBe(1)
		expect(selectedDirectoryGroupMatchCount(groups, ["engineering", "product"], "e")).toBe(2)
	})
})

describe("userGroupCatalogMessage", () => {
	it("stays quiet while there are groups to add", () => {
		expect(userGroupCatalogMessage("", 4, 0)).toBeNull()
		expect(userGroupCatalogMessage("sal", 1, 0)).toBeNull()
	})

	it("says when the search only matches groups already selected", () => {
		expect(userGroupCatalogMessage("eng", 0, 1)).toBe("That group is already selected")
		expect(userGroupCatalogMessage("e", 0, 2)).toBe("Those groups are already selected")
	})

	it("says when nothing matches", () => {
		expect(userGroupCatalogMessage("zzz", 0, 0)).toBe("No groups found")
		expect(userGroupCatalogMessage("   ", 0, 0)).toBe("No groups to add")
	})
})

describe("directoryGroupRoleForUser", () => {
	it("uses the draft role, then the directory membership, then member", () => {
		const engineering = group("engineering", "Engineering")
		engineering.members = [{ email: "jane.doe@example.com", role: directoryGroupMemberRoles.owner }]
		expect(directoryGroupRoleForUser("jane.doe@example.com", engineering, [
			{ groupId: "engineering", role: directoryGroupMemberRoles.manager },
		])).toBe(directoryGroupMemberRoles.manager)
		expect(directoryGroupRoleForUser("Jane.Doe@example.com", engineering, undefined))
			.toBe(directoryGroupMemberRoles.owner)
		expect(directoryGroupRoleForUser("sam.lee@example.com", engineering, undefined))
			.toBe(directoryGroupMemberRoles.member)
	})
})

describe("revealRowScrollTop", () => {
	it("leaves the scroll position when the row is already visible", () => {
		expect(revealRowScrollTop(40, 200, 80, 52)).toBe(40)
	})

	it("scrolls up to a row above the viewport", () => {
		expect(revealRowScrollTop(180, 200, 20, 52)).toBe(20)
	})

	it("scrolls down to a row below the viewport", () => {
		expect(revealRowScrollTop(0, 200, 240, 52)).toBe(92)
	})
})
