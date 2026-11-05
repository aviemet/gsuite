import { describe, expect, it } from "vitest"

import {
	sortDirectoryUsers,
	toDirectoryUserRow,
} from "@/frontend/features/directory/UsersTable/sortDirectoryUsers"
import { type DirectoryUser, emptyDirectoryProfile } from "@/shared/directoryFixtures"

function user(partial: Partial<DirectoryUser> & Pick<DirectoryUser, "email" | "displayName">): DirectoryUser {
	return {
		...emptyDirectoryProfile(),
		signatureHtml: "",
		groupIds: [],
		organizationalUnitPaths: [],
		...partial,
	}
}

const alpha = toDirectoryUserRow(user({
	email: "alpha@example.com",
	displayName: "Alpha",
	jobTitle: "Engineer",
	department: "Engineering",
	organizationalUnitPaths: ["/", "/Engineering"],
	groupIds: ["engineering"],
}))

const bravo = toDirectoryUserRow(user({
	email: "bravo@example.com",
	displayName: "Bravo",
	jobTitle: "Manager",
	department: "Sales",
	organizationalUnitPaths: ["/", "/Sales", "/Sales/West"],
	groupIds: ["sales", "all-employees"],
}))

describe("sortDirectoryUsers", () => {
	it("sorts by displayName ascending and descending", () => {
		expect(sortDirectoryUsers([bravo, alpha], {
			columnAccessor: "displayName",
			direction: "asc",
		}).map((row) => row.email)).toEqual(["alpha@example.com", "bravo@example.com"])

		expect(sortDirectoryUsers([alpha, bravo], {
			columnAccessor: "displayName",
			direction: "desc",
		}).map((row) => row.email)).toEqual(["bravo@example.com", "alpha@example.com"])
	})

	it("sorts by groupCount ascending and descending", () => {
		expect(sortDirectoryUsers([bravo, alpha], {
			columnAccessor: "groupCount",
			direction: "asc",
		}).map((row) => row.email)).toEqual(["alpha@example.com", "bravo@example.com"])

		expect(sortDirectoryUsers([alpha, bravo], {
			columnAccessor: "groupCount",
			direction: "desc",
		}).map((row) => row.email)).toEqual(["bravo@example.com", "alpha@example.com"])
	})

	it("reads the work phone and ignores other phone types", () => {
		const row = toDirectoryUserRow(user({
			email: "jane.doe@example.com",
			displayName: "Jane Doe",
			phoneNumbers: [
				{ type: "mobile", number: "+1-555-123-4567" },
				{ type: "work", number: "+1-555-987-6543" },
			],
		}))
		expect(row.workPhone).toBe("+1-555-987-6543")

		const mobileOnly = toDirectoryUserRow(user({
			email: "alex.kim@example.com",
			displayName: "Alex Kim",
			phoneNumbers: [{ type: "mobile", number: "+1-555-111-2222" }],
		}))
		expect(mobileOnly.workPhone).toBe("")
	})

	it("sorts by work phone", () => {
		const withWorkPhone = toDirectoryUserRow(user({
			email: "jane.doe@example.com",
			displayName: "Jane Doe",
			phoneNumbers: [{ type: "work", number: "+1-555-987-6543" }],
		}))
		const withoutWorkPhone = toDirectoryUserRow(user({
			email: "alex.kim@example.com",
			displayName: "Alex Kim",
		}))
		expect(sortDirectoryUsers([withWorkPhone, withoutWorkPhone], {
			columnAccessor: "workPhone",
			direction: "asc",
		}).map((row) => row.email)).toEqual(["alex.kim@example.com", "jane.doe@example.com"])
	})

	it("sorts by organizationalUnit", () => {
		expect(sortDirectoryUsers([bravo, alpha], {
			columnAccessor: "organizationalUnit",
			direction: "asc",
		}).map((row) => row.organizationalUnit)).toEqual(["/Engineering", "/Sales/West"])
	})
})
