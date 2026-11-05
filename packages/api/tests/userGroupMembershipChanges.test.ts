import { describe, expect, it } from "vitest"

import { parseDirectoryUserUpdate } from "../src/directory/parseDirectoryUpdate"
import { userGroupMembershipChanges } from "../src/directory/userGroupMembershipChanges"

const groups = [
	{
		id: "engineering",
		members: [{ email: "jane.doe@example.com", role: "MEMBER" as const }],
	},
	{
		id: "sales",
		members: [{ email: "sam.lee@example.com", role: "OWNER" as const }],
	},
]

describe("userGroupMembershipChanges", () => {
	it("inserts, updates, and deletes membership from the submitted roles", () => {
		expect(userGroupMembershipChanges(
			"jane.doe@example.com",
			groups,
			["engineering", "product"],
			[
				{ groupId: "engineering", role: "MANAGER" },
				{ groupId: "product", role: "OWNER" },
			],
		)).toEqual([
			{ action: "update", groupId: "engineering", role: "MANAGER" },
			{ action: "insert", groupId: "product", role: "OWNER" },
		])
	})

	it("defaults a new membership to member when no role was submitted", () => {
		expect(userGroupMembershipChanges("jane.doe@example.com", groups, ["sales"], undefined)).toEqual([
			{ action: "delete", groupId: "engineering" },
			{ action: "insert", groupId: "sales", role: "MEMBER" },
		])
	})
})

describe("parseDirectoryUserUpdate group roles", () => {
	it("reads member, manager, and owner", () => {
		expect(parseDirectoryUserUpdate({
			email: "jane.doe@example.com",
			groupIds: ["engineering"],
			groupMemberships: [{ groupId: "engineering", role: "OWNER" }],
		}).groupMemberships).toEqual([{ groupId: "engineering", role: "OWNER" }])
	})

	it("rejects a role the Directory API does not accept", () => {
		expect(() => parseDirectoryUserUpdate({
			email: "jane.doe@example.com",
			groupMemberships: [{ groupId: "engineering", role: "VIEW" }],
		})).toThrow("Invalid member role")
	})
})
