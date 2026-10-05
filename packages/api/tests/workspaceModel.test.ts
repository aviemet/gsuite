import { describe, expect, it } from "vitest"

import { buildDirectorySnapshot, organizationalUnitPaths } from "../src/directory/snapshot"
import { parseServiceAccount } from "../src/google/serviceAccount"

describe("organizationalUnitPaths", () => {
	it("includes every ancestor", () => {
		expect(organizationalUnitPaths("/Engineering/Platform")).toEqual([
			"/",
			"/Engineering",
			"/Engineering/Platform",
		])
	})
})

describe("buildDirectorySnapshot", () => {
	it("attaches group membership and ancestor organizational units", () => {
		const snapshot = buildDirectorySnapshot({
			users: [{ email: "Jane.Doe@example.com", displayName: "Jane Doe", orgUnitPath: "/Engineering" }],
			groups: [{ id: "engineering", name: "Engineering", email: "Engineering@example.com" }],
			members: [{ groupId: "engineering", email: "jane.doe@example.com" }],
			organizationalUnits: [{ path: "/Engineering", name: "Engineering" }],
		})

		expect(snapshot.users[0]).toMatchObject({
			email: "jane.doe@example.com",
			groupIds: ["engineering"],
			organizationalUnitPaths: ["/", "/Engineering"],
		})
		expect(snapshot.groups[0]?.email).toBe("engineering@example.com")
		expect(snapshot.organizationalUnits.map((unit) => unit.path)).toEqual(["/", "/Engineering"])
	})
})

describe("parseServiceAccount", () => {
	it("reads the delegation client id and key", () => {
		expect(parseServiceAccount({
			client_email: "app@project.iam.gserviceaccount.com",
			private_key: "key",
			client_id: "123",
		})).toEqual({
			clientEmail: "app@project.iam.gserviceaccount.com",
			privateKey: "key",
			clientId: "123",
		})
	})

	it("returns undefined when the key is missing", () => {
		expect(parseServiceAccount({ client_email: "app@project.iam.gserviceaccount.com" })).toBeUndefined()
	})
})
