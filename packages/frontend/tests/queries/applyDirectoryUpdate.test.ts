import { describe, expect, it } from "vitest"

import { applyDirectoryGroupUpdate, applyDirectoryUserUpdate } from "@/frontend/queries/applyDirectoryUpdate"
import { type DirectorySnapshot } from "@/frontend/queries/directory"
import { type DirectoryGroup, type DirectoryUser, emptyDirectoryProfile } from "@/shared/directoryFixtures"
import { type DirectoryGroupUpdate, type DirectoryUserUpdate } from "@/shared/directoryUpdate"

function user(partial: Partial<DirectoryUser> & Pick<DirectoryUser, "email" | "displayName">): DirectoryUser {
	return {
		...emptyDirectoryProfile(),
		signatureHtml: "",
		groupIds: [],
		organizationalUnitPaths: ["/"],
		givenName: "Jane",
		familyName: "Doe",
		...partial,
	}
}

function group(partial: Partial<DirectoryGroup> & Pick<DirectoryGroup, "id" | "name" | "email">): DirectoryGroup {
	return {
		description: "",
		members: [],
		...partial,
	}
}

function snapshot(): DirectorySnapshot {
	return {
		users: [
			user({
				email: "jane.doe@example.com",
				displayName: "Jane Doe",
				jobTitle: "Product Manager",
				groupIds: ["engineering"],
				organizationalUnitPaths: ["/", "/Engineering"],
			}),
			user({
				email: "sam.lee@example.com",
				displayName: "Sam Lee",
				givenName: "Sam",
				familyName: "Lee",
				groupIds: ["engineering"],
			}),
		],
		groups: [
			group({
				id: "engineering",
				name: "Engineering",
				email: "engineering@example.com",
				members: [
					{ email: "jane.doe@example.com", role: "MEMBER" },
					{ email: "sam.lee@example.com", role: "OWNER" },
				],
			}),
			group({
				id: "sales",
				name: "Sales",
				email: "sales@example.com",
			}),
		],
		organizationalUnits: [{ path: "/", name: "Workspace" }],
	}
}

function userUpdate(partial: Partial<DirectoryUserUpdate> = {}): DirectoryUserUpdate {
	return {
		email: "jane.doe@example.com",
		givenName: "Jane",
		familyName: "Doe",
		organizationalUnitPath: "/Engineering",
		jobTitle: "Director",
		department: "Product",
		organization: "",
		location: "",
		employeeId: "",
		address: "",
		costCenter: "",
		managerEmail: "",
		phoneNumbers: [],
		groupIds: ["engineering"],
		...partial,
	}
}

describe("applyDirectoryUserUpdate", () => {
	it("shows the submitted job title on the user", () => {
		const next = applyDirectoryUserUpdate(snapshot(), userUpdate())
		expect(next.users[0]?.jobTitle).toBe("Director")
		expect(next.users[1]?.jobTitle).toBe("")
	})

	it("keeps the submitted job title when the listing still has the previous one", () => {
		const current = snapshot()
		const stale = {
			...current,
			users: current.users.map((entry) => (
				entry.email === "jane.doe@example.com"
					? { ...entry, jobTitle: "Product Manager" }
					: entry
			)),
		}
		const next = applyDirectoryUserUpdate(stale, userUpdate({ jobTitle: "Director" }))
		expect(next.users.find((entry) => entry.email === "jane.doe@example.com")?.jobTitle).toBe("Director")
	})

	it("moves group membership to the submitted groups", () => {
		const next = applyDirectoryUserUpdate(snapshot(), userUpdate({ groupIds: ["sales"] }))
		const jane = next.users.find((entry) => entry.email === "jane.doe@example.com")
		expect(jane?.groupIds).toEqual(["sales"])
		expect(next.groups.find((entry) => entry.id === "engineering")?.members.map((member) => member.email))
			.toEqual(["sam.lee@example.com"])
		expect(next.groups.find((entry) => entry.id === "sales")?.members).toEqual([
			{ email: "jane.doe@example.com", role: "MEMBER" },
		])
	})

	it("writes the submitted group role onto an existing membership", () => {
		const next = applyDirectoryUserUpdate(snapshot(), userUpdate({
			groupMemberships: [{ groupId: "engineering", role: "MANAGER" }],
		}))
		expect(next.groups.find((entry) => entry.id === "engineering")?.members).toEqual([
			{ email: "jane.doe@example.com", role: "MANAGER" },
			{ email: "sam.lee@example.com", role: "OWNER" },
		])
	})
})

describe("applyDirectoryGroupUpdate", () => {
	it("shows the submitted group name and member list", () => {
		const update: DirectoryGroupUpdate = {
			id: "engineering",
			name: "Platform",
			email: "platform@example.com",
			description: "Platform team",
			members: [{ email: "sam.lee@example.com", role: "OWNER" }],
		}
		const next = applyDirectoryGroupUpdate(snapshot(), update)
		const engineering = next.groups.find((entry) => entry.id === "engineering")
		expect(engineering?.name).toBe("Platform")
		expect(engineering?.members).toEqual([{ email: "sam.lee@example.com", role: "OWNER" }])
		expect(next.users.find((entry) => entry.email === "jane.doe@example.com")?.groupIds).toEqual([])
		expect(next.users.find((entry) => entry.email === "sam.lee@example.com")?.groupIds).toEqual(["engineering"])
	})
})
