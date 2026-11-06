import { type DirectoryUserUpdate, memberChanges } from "@gsuite/shared"
import { describe, expect, it } from "vitest"

import {
	directoryUserNeedsProfileRead,
	directoryUserProfileChanges,
} from "../src/directory/directoryUpdateDiff"
import { googleGroupPatchBody, googleUserPatchBody } from "../src/directory/googleDirectoryUpdate"
import { MockDirectoryClient } from "../src/directory/mockClient"

const userUpdate: DirectoryUserUpdate = {
	email: "jane.doe@example.com",
	givenName: "Janet",
	familyName: "Doe",
	organizationalUnitPath: "/Product",
	jobTitle: "Director",
	department: "Product",
	organization: "Example Corp",
	location: "Austin",
	employeeId: "E-1",
	address: "1 Main",
	costCenter: "CC-1",
	managerEmail: "sam.lee@example.com",
	phoneNumbers: [{ type: "work", number: "+1-555-0000" }],
	groupIds: ["product"],
	groupMemberships: [{ groupId: "product", role: "MEMBER" }],
}

function withProfile(overrides: Partial<DirectoryUserUpdate>): DirectoryUserUpdate {
	return { ...userUpdate, ...overrides }
}

describe("googleUserPatchBody", () => {
	it("patches a changed name without rewriting organization fields", () => {
		const baseline = withProfile({ givenName: "Jane", jobTitle: "Director" })
		const next = withProfile({ givenName: "Janet", jobTitle: "Director" })
		const changes = directoryUserProfileChanges(baseline, next)
		expect(directoryUserNeedsProfileRead(changes)).toBe(false)
		expect(googleUserPatchBody(changes, next, undefined)).toEqual({
			name: { givenName: "Janet", familyName: "Doe", fullName: "Janet Doe" },
		})
	})

	it("keeps external ids this app does not edit", () => {
		const baseline = withProfile({ employeeId: "E-1" })
		const next = withProfile({ employeeId: "E-2" })
		const changes = directoryUserProfileChanges(baseline, next)
		expect(directoryUserNeedsProfileRead(changes)).toBe(true)
		expect(googleUserPatchBody(changes, next, {
			externalIds: [
				{ type: "organization", value: "E-1" },
				{ type: "custom", value: "keep-me" },
			],
			organizations: [{ primary: true, title: "Director", description: "Builds things" }],
		})).toEqual({
			externalIds: [
				{ type: "organization", value: "E-2" },
				{ type: "custom", value: "keep-me" },
			],
		})
	})

	it("keeps the organization description when the job title changes", () => {
		const baseline = withProfile({ jobTitle: "Engineer" })
		const next = withProfile({ jobTitle: "Director" })
		const body = googleUserPatchBody(directoryUserProfileChanges(baseline, next), next, {
			organizations: [{
				primary: true,
				title: "Engineer",
				description: "Builds things",
				department: "Product",
			}],
		})
		expect(body?.organizations?.[0]).toMatchObject({
			title: "Director",
			description: "Builds things",
			department: "Product",
		})
		expect(body?.externalIds).toBeUndefined()
	})

	it("keeps phone numbers this app does not edit", () => {
		const baseline = withProfile({ phoneNumbers: [{ type: "work", number: "555" }] })
		const next = withProfile({ phoneNumbers: [{ type: "work", number: "556" }] })
		const body = googleUserPatchBody(directoryUserProfileChanges(baseline, next), next, {
			phones: [
				{ type: "work", value: "555", primary: true },
				{ type: "custom", value: "123" },
			],
		})
		expect(body?.phones).toEqual([
			{ type: "work", value: "556", primary: true },
			{ type: "custom", value: "123" },
		])
	})

	it("omits a patch when nothing changed", () => {
		const changes = directoryUserProfileChanges(userUpdate, userUpdate)
		expect(googleUserPatchBody(changes, userUpdate, undefined)).toBeUndefined()
	})
})

describe("googleGroupPatchBody", () => {
	it("sends only the group fields that changed", () => {
		expect(googleGroupPatchBody(
			{
				id: "sales",
				name: "Sales",
				email: "sales@example.com",
				description: "",
				members: [],
			},
			{
				id: "sales",
				name: " Revenue ",
				email: "Revenue@Example.com",
				description: " Sales team ",
				members: [],
			},
		)).toEqual({
			name: "Revenue",
			email: "revenue@example.com",
			description: "Sales team",
		})
	})

	it("skips the group write when the details are unchanged", () => {
		const group = {
			id: "sales",
			name: "Sales",
			email: "sales@example.com",
			description: "",
			members: [],
		}
		expect(googleGroupPatchBody(group, group)).toBeUndefined()
	})
})

describe("memberChanges", () => {
	it("splits added, removed, and role changes", () => {
		expect(memberChanges(
			[
				{ email: "jane.doe@example.com", role: "MEMBER" },
				{ email: "sam.lee@example.com", role: "MEMBER" },
			],
			[
				{ email: "sam.lee@example.com", role: "OWNER" },
				{ email: "alex.kim@example.com", role: "MEMBER" },
			],
		)).toEqual({
			added: [{ email: "alex.kim@example.com", role: "MEMBER" }],
			removed: [{ email: "jane.doe@example.com", role: "MEMBER" }],
			updated: [{ email: "sam.lee@example.com", role: "OWNER" }],
		})
	})
})

describe("MockDirectoryClient updates", () => {
	it("writes user fields and membership back into the snapshot", async () => {
		const client = new MockDirectoryClient()
		const saved = await client.updateUser({
			baseline: withProfile({
				givenName: "Jane",
				jobTitle: "Product Manager",
				groupIds: ["engineering", "product", "all-employees"],
			}),
			next: userUpdate,
		})
		expect(saved.jobTitle).toBe("Director")
		expect(saved.groupIds).toEqual(["product"])
		expect(saved.organizationalUnitPaths).toEqual(["/", "/Product"])
		const snapshot = await client.listDirectory()
		const product = snapshot.groups.find((group) => group.id === "product")
		expect(product?.members.find((member) => member.email === userUpdate.email)?.role).toBe("MEMBER")
		const engineering = snapshot.groups.find((group) => group.id === "engineering")
		expect(engineering?.members.some((member) => member.email === userUpdate.email)).toBe(false)
	})

	it("updates an existing group role from the user draft", async () => {
		const client = new MockDirectoryClient()
		const next = withProfile({
			groupIds: ["engineering"],
			groupMemberships: [{ groupId: "engineering", role: "OWNER" }],
		})
		await client.updateUser({
			baseline: withProfile({ groupIds: ["engineering"] }),
			next,
		})
		const snapshot = await client.listDirectory()
		const engineering = snapshot.groups.find((group) => group.id === "engineering")
		expect(engineering?.members.find((member) => member.email === userUpdate.email)?.role).toBe("OWNER")
	})

	it("writes group details and member roles", async () => {
		const client = new MockDirectoryClient()
		const before = await client.listDirectory()
		const sales = before.groups.find((group) => group.id === "sales")
		if(!sales) throw new Error("Expected the sales group")
		const saved = await client.updateGroup({
			baseline: {
				id: sales.id,
				name: sales.name,
				email: sales.email,
				description: sales.description,
				members: sales.members,
			},
			next: {
				id: "sales",
				name: "Revenue",
				email: "revenue@example.com",
				description: "Sales team",
				members: [
					{ email: "sam.lee@example.com", role: "OWNER" },
					{ email: "jane.doe@example.com", role: "MEMBER" },
				],
			},
		})
		expect(saved).toMatchObject({
			name: "Revenue",
			email: "revenue@example.com",
			description: "Sales team",
		})
		expect(saved.members).toEqual([
			{ email: "sam.lee@example.com", role: "OWNER" },
			{ email: "jane.doe@example.com", role: "MEMBER" },
		])
		const snapshot = await client.listDirectory()
		const jane = snapshot.users.find((user) => user.email === "jane.doe@example.com")
		expect(jane?.groupIds).toContain("sales")
	})
})
