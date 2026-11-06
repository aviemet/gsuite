import { type DirectoryUserUpdate } from "@gsuite/shared"
import { describe, expect, it } from "vitest"

import { type GoogleUserPatchBody } from "../src/directory/googleDirectoryUpdate"
import { type GoogleDirectoryUserLike } from "../src/directory/mapDirectoryUserProfile"
import { type DirectoryAdminApi, RealDirectoryClient } from "../src/directory/realClient"

const profile: DirectoryUserUpdate = {
	email: "jane.doe@example.com",
	givenName: "Jane",
	familyName: "Doe",
	organizationalUnitPath: "/",
	jobTitle: "Engineer",
	department: "Engineering",
	organization: "Example",
	location: "NYC",
	employeeId: "E-1",
	address: "1 Main",
	costCenter: "CC",
	managerEmail: "boss@example.com",
	phoneNumbers: [{ type: "work", number: "555" }],
	groupIds: ["engineering"],
	groupMemberships: [{ groupId: "engineering", role: "MEMBER" }],
}

function googleUser(): GoogleDirectoryUserLike {
	return {
		primaryEmail: "jane.doe@example.com",
		isAdmin: false,
		name: { givenName: "Jane", familyName: "Doe", fullName: "Jane Doe" },
		orgUnitPath: "/",
		organizations: [{
			primary: true,
			title: "Engineer",
			department: "Engineering",
			name: "Example",
			description: "Builds things",
			location: "NYC",
			costCenter: "CC",
		}],
		externalIds: [
			{ type: "organization", value: "E-1" },
			{ type: "custom", value: "keep-me" },
		],
		phones: [
			{ type: "work", value: "555", primary: true },
			{ type: "custom", value: "123" },
		],
		relations: [
			{ type: "manager", value: "boss@example.com" },
			{ type: "assistant", value: "assistant@example.com" },
		],
		addresses: [{ type: "work", formatted: "1 Main", primary: true }],
	}
}

function createAdmin() {
	const calls: string[] = []
	const patches: GoogleUserPatchBody[] = []
	const admin: DirectoryAdminApi = {
		users: {
			async list() {
				calls.push("users.list")
				return { data: { users: [googleUser()] } }
			},
			async get(params) {
				calls.push("users.get")
				if(params.userKey !== "jane.doe@example.com") throw { code: 404 }
				return { data: googleUser() }
			},
			async patch(params) {
				calls.push("users.patch")
				patches.push(params.requestBody)
				return {
					data: {
						...googleUser(),
						...params.requestBody,
						primaryEmail: "jane.doe@example.com",
					},
				}
			},
		},
		groups: {
			async list() {
				calls.push("groups.list")
				return {
					data: {
						groups: [
							{ id: "engineering", email: "engineering@example.com", name: "Engineering" },
							{ id: "sales", email: "sales@example.com", name: "Sales" },
						],
					},
				}
			},
			async get() {
				calls.push("groups.get")
				return { data: { id: "engineering", email: "engineering@example.com", name: "Engineering" } }
			},
			async patch() {
				calls.push("groups.patch")
				return { data: {} }
			},
		},
		members: {
			async list(params) {
				calls.push(`members.list:${ params.groupKey }`)
				return {
					data: {
						members: [{ email: "jane.doe@example.com", role: "MEMBER" }],
					},
				}
			},
			async insert() {
				calls.push("members.insert")
				return { data: {} }
			},
			async update() {
				calls.push("members.update")
				return { data: {} }
			},
			async delete() {
				calls.push("members.delete")
				return { data: {} }
			},
		},
		orgunits: {
			async list() {
				calls.push("orgunits.list")
				return { data: { organizationUnits: [{ orgUnitPath: "/", name: "Workspace" }] } }
			},
		},
	}
	return { admin, calls, patches }
}

describe("RealDirectoryClient updates", () => {
	it("patches one changed profile field and does not list the directory", async () => {
		const { admin, calls, patches } = createAdmin()
		const client = new RealDirectoryClient("admin@example.com", admin)
		await client.updateUser({
			baseline: profile,
			next: { ...profile, jobTitle: "Director" },
		})
		expect(calls).toEqual(["users.get", "users.patch"])
		expect(patches[0]?.organizations?.[0]).toMatchObject({
			title: "Director",
			description: "Builds things",
		})
		expect(patches[0]?.externalIds).toBeUndefined()
	})

	it("patches a name without reading the user", async () => {
		const { admin, calls } = createAdmin()
		const client = new RealDirectoryClient("admin@example.com", admin)
		await client.updateUser({
			baseline: profile,
			next: { ...profile, givenName: "Janet" },
		})
		expect(calls).toEqual(["users.patch"])
	})

	it("makes no Directory calls when the draft is unchanged", async () => {
		const { admin, calls } = createAdmin()
		const client = new RealDirectoryClient("admin@example.com", admin)
		await client.updateUser({ baseline: profile, next: profile })
		expect(calls).toEqual([])
	})

	it("writes only the group that was added", async () => {
		const { admin, calls } = createAdmin()
		const client = new RealDirectoryClient("admin@example.com", admin)
		await client.updateUser({
			baseline: profile,
			next: {
				...profile,
				groupIds: ["engineering", "sales"],
				groupMemberships: [
					{ groupId: "engineering", role: "MEMBER" },
					{ groupId: "sales", role: "MEMBER" },
				],
			},
		})
		expect(calls).toEqual(["members.insert"])
	})

	it("treats a missing membership delete as already removed", async () => {
		const { admin, calls } = createAdmin()
		admin.members.delete = async () => {
			calls.push("members.delete")
			throw { code: 404 }
		}
		const client = new RealDirectoryClient("admin@example.com", admin)
		await expect(client.updateUser({
			baseline: profile,
			next: { ...profile, groupIds: [], groupMemberships: [] },
		})).resolves.toMatchObject({ email: profile.email })
		expect(calls).toEqual(["members.delete"])
	})

	it("updates a membership that already exists", async () => {
		const { admin, calls } = createAdmin()
		admin.members.insert = async () => {
			calls.push("members.insert")
			throw { code: 409 }
		}
		const client = new RealDirectoryClient("admin@example.com", admin)
		await client.updateUser({
			baseline: { ...profile, groupIds: [], groupMemberships: [] },
			next: profile,
		})
		expect(calls).toEqual(["members.insert", "members.update"])
	})

	it("loads recipient profiles without groups or org units", async () => {
		const { admin, calls } = createAdmin()
		const client = new RealDirectoryClient("admin@example.com", admin)
		const users = await client.loadUsersForEmails(["jane.doe@example.com", "missing@example.com"])
		expect(users.map((user) => user.email)).toEqual(["jane.doe@example.com"])
		expect(calls).toEqual(["users.get", "users.get"])
	})

	it("lists users once when the recipient list is a full page", async () => {
		const { admin, calls } = createAdmin()
		const client = new RealDirectoryClient("admin@example.com", admin)
		const emails = Array.from({ length: 500 }, (_unused, index) => `person-${ index }@example.com`)
		emails[0] = "jane.doe@example.com"
		const users = await client.loadUsersForEmails(emails)
		expect(users.map((user) => user.email)).toEqual(["jane.doe@example.com"])
		expect(calls).toEqual(["users.list"])
	})

	it("reads each group's members while listing the directory", async () => {
		const { admin, calls } = createAdmin()
		const client = new RealDirectoryClient("admin@example.com", admin)
		const snapshot = await client.listDirectory()
		expect(calls).toEqual([
			"users.list",
			"groups.list",
			"orgunits.list",
			"members.list:engineering",
			"members.list:sales",
		])
		expect(snapshot.groups).toHaveLength(2)
		expect(snapshot.users[0]?.groupIds.sort()).toEqual(["engineering", "sales"])
	})
})
