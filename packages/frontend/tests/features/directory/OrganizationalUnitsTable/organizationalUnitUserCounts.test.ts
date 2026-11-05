import { describe, expect, it } from "vitest"

import { toDirectoryOrganizationalUnitRows } from "@/frontend/features/directory/OrganizationalUnitsTable/organizationalUnitUserCounts"
import {
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
	emptyDirectoryProfile,
} from "@/shared/directoryFixtures"

function user(organizationalUnitPaths: string[]): DirectoryUser {
	return {
		...emptyDirectoryProfile(),
		email: `${ organizationalUnitPaths.join("-") }@example.com`,
		displayName: "User",
		signatureHtml: "",
		groupIds: [],
		organizationalUnitPaths,
	}
}

const organizationalUnits: DirectoryOrganizationalUnit[] = [
	{ path: "/", name: "Example Corp" },
	{ path: "/Engineering", name: "Engineering" },
	{ path: "/Sales", name: "Sales" },
]

describe("toDirectoryOrganizationalUnitRows", () => {
	it("counts users whose paths include each OU", () => {
		expect(toDirectoryOrganizationalUnitRows(organizationalUnits, [
			user(["/", "/Engineering"]),
			user(["/", "/Engineering"]),
			user(["/", "/Sales"]),
		])).toEqual([
			{ path: "/", name: "Example Corp", userCount: 3 },
			{ path: "/Engineering", name: "Engineering", userCount: 2 },
			{ path: "/Sales", name: "Sales", userCount: 1 },
		])
	})
})
