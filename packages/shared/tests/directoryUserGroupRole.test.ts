import { describe, expect, it } from "vitest"

import { directoryGroupMemberRoles } from "../src/directoryFixtures"
import { directoryUserGroupRole, nextGroupMembersForUser } from "../src/directoryUpdate"

describe("directoryUserGroupRole", () => {
	it("returns the submitted role, or member when the group has none", () => {
		expect(directoryUserGroupRole("engineering", [
			{ groupId: "engineering", role: directoryGroupMemberRoles.owner },
		])).toBe("OWNER")
		expect(directoryUserGroupRole("sales", undefined)).toBe("MEMBER")
	})
})

describe("nextGroupMembersForUser", () => {
	const members = [
		{ email: "jane.doe@example.com", role: directoryGroupMemberRoles.member },
		{ email: "sam.lee@example.com", role: directoryGroupMemberRoles.owner },
	]

	it("adds a user with the submitted role", () => {
		expect(nextGroupMembersForUser(members, "alex.kim@example.com", true, "MANAGER")).toEqual([
			...members,
			{ email: "alex.kim@example.com", role: "MANAGER" },
		])
	})

	it("changes the role of someone who is already in the group", () => {
		expect(nextGroupMembersForUser(members, "Jane.Doe@example.com", true, "OWNER")).toEqual([
			{ email: "jane.doe@example.com", role: "OWNER" },
			members[1],
		])
	})

	it("removes someone who is no longer in the group", () => {
		expect(nextGroupMembersForUser(members, "jane.doe@example.com", false, "MEMBER")).toEqual([
			members[1],
		])
	})
})
