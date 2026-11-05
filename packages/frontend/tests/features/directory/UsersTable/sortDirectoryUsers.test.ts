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

	it("sorts by organizationalUnit", () => {
		expect(sortDirectoryUsers([bravo, alpha], {
			columnAccessor: "organizationalUnit",
			direction: "asc",
		}).map((row) => row.organizationalUnit)).toEqual(["/Engineering", "/Sales/West"])
	})
})
