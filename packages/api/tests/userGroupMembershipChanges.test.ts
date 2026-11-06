import { type DirectoryUserUpdate } from "@gsuite/shared"
import { describe, expect, it } from "vitest"

import { directoryUserMembershipChanges } from "../src/directory/directoryUpdateDiff"
import { parseDirectoryUserUpdate } from "../src/directory/parseDirectoryUpdate"

const baseline: DirectoryUserUpdate = {
	email: "jane.doe@example.com",
	givenName: "Jane",
	familyName: "Doe",
	organizationalUnitPath: "/",
	jobTitle: "",
	department: "",
	organization: "",
	location: "",
	employeeId: "",
	address: "",
	costCenter: "",
	managerEmail: "",
	phoneNumbers: [],
	groupIds: ["engineering", "sales"],
	groupMemberships: [
		{ groupId: "engineering", role: "MEMBER" },
		{ groupId: "sales", role: "MEMBER" },
	],
}

describe("directoryUserMembershipChanges", () => {
	it("inserts, updates, and leaves untouched groups unwritten", () => {
		expect(directoryUserMembershipChanges(baseline, {
			...baseline,
			groupIds: ["engineering", "sales", "product"],
			groupMemberships: [
				{ groupId: "engineering", role: "MANAGER" },
				{ groupId: "sales", role: "MEMBER" },
				{ groupId: "product", role: "OWNER" },
			],
		})).toEqual([
			{ action: "update", groupId: "engineering", role: "MANAGER" },
			{ action: "insert", groupId: "product", role: "OWNER" },
		])
	})

	it("removes a group that is no longer selected", () => {
		expect(directoryUserMembershipChanges(
			baseline,
			{ ...baseline, groupIds: ["sales"], groupMemberships: [{ groupId: "sales", role: "MEMBER" }] },
		)).toEqual([
			{ action: "delete", groupId: "engineering" },
		])
	})

	it("defaults a new membership to member when no role was submitted", () => {
		expect(directoryUserMembershipChanges(
			{ ...baseline, groupIds: ["engineering"], groupMemberships: undefined },
			{ ...baseline, groupIds: ["engineering", "product"], groupMemberships: undefined },
		)).toEqual([
			{ action: "insert", groupId: "product", role: "MEMBER" },
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
