import { type DirectoryUserUpdate, memberChanges } from "@gsuite/shared"
import { describe, expect, it } from "vitest"

import { googleGroupUpdateBody, googleUserUpdateBody } from "../src/directory/googleDirectoryUpdate"
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
}

describe("googleUserUpdateBody", () => {
	it("maps a user draft onto the Directory user update", () => {
		expect(googleUserUpdateBody(userUpdate)).toEqual({
			name: { givenName: "Janet", familyName: "Doe", fullName: "Janet Doe" },
			orgUnitPath: "/Product",
			organizations: [{
				primary: true,
				title: "Director",
				department: "Product",
				name: "Example Corp",
				location: "Austin",
				costCenter: "CC-1",
			}],
			phones: [{ type: "work", value: "+1-555-0000", primary: true }],
			addresses: [{ type: "work", formatted: "1 Main", primary: true }],
			externalIds: [{ type: "organization", value: "E-1" }],
			relations: [{ type: "manager", value: "sam.lee@example.com" }],
		})
	})
})

describe("googleGroupUpdateBody", () => {
	it("maps a group draft onto the Directory group update", () => {
		expect(googleGroupUpdateBody({
			name: " Revenue ",
			email: "Revenue@Example.com",
			description: " Sales team ",
		})).toEqual({
			name: "Revenue",
			email: "revenue@example.com",
			description: "Sales team",
		})
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
		const snapshot = await client.updateUser(userUpdate)
		const user = snapshot.users.find((entry) => entry.email === userUpdate.email)
		expect(user?.jobTitle).toBe("Director")
		expect(user?.groupIds).toEqual(["product"])
		expect(user?.organizationalUnitPaths).toEqual(["/", "/Product"])
		const product = snapshot.groups.find((group) => group.id === "product")
		expect(product?.members.find((member) => member.email === userUpdate.email)?.role).toBe("MEMBER")
		const engineering = snapshot.groups.find((group) => group.id === "engineering")
		expect(engineering?.members.some((member) => member.email === userUpdate.email)).toBe(false)
	})

	it("updates an existing group role from the user draft", async () => {
		const client = new MockDirectoryClient()
		const snapshot = await client.updateUser({
			...userUpdate,
			groupIds: ["engineering"],
			groupMemberships: [{ groupId: "engineering", role: "OWNER" }],
		})
		const engineering = snapshot.groups.find((group) => group.id === "engineering")
		expect(engineering?.members.find((member) => member.email === userUpdate.email)?.role).toBe("OWNER")
	})

	it("writes group details and member roles", async () => {
		const client = new MockDirectoryClient()
		const snapshot = await client.updateGroup({
			id: "sales",
			name: "Revenue",
			email: "revenue@example.com",
			description: "Sales team",
			members: [
				{ email: "sam.lee@example.com", role: "OWNER" },
				{ email: "jane.doe@example.com", role: "MEMBER" },
			],
		})
		const sales = snapshot.groups.find((group) => group.id === "sales")
		expect(sales).toMatchObject({
			name: "Revenue",
			email: "revenue@example.com",
			description: "Sales team",
		})
		expect(sales?.members).toEqual([
			{ email: "sam.lee@example.com", role: "OWNER" },
			{ email: "jane.doe@example.com", role: "MEMBER" },
		])
		const jane = snapshot.users.find((user) => user.email === "jane.doe@example.com")
		expect(jane?.groupIds).toContain("sales")
	})
})
