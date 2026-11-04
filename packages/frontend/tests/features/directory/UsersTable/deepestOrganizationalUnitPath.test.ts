import { describe, expect, it } from "vitest"

import { deepestOrganizationalUnitPath } from "@/frontend/features/directory/UsersTable/deepestOrganizationalUnitPath"

describe("deepestOrganizationalUnitPath", () => {
	it("returns an empty string when there are no paths", () => {
		expect(deepestOrganizationalUnitPath([])).toBe("")
	})

	it("returns the path with the most segments", () => {
		expect(deepestOrganizationalUnitPath([
			"/",
			"/Engineering",
			"/Engineering/Platform",
		])).toBe("/Engineering/Platform")
	})

	it("keeps the first path when depths are equal", () => {
		expect(deepestOrganizationalUnitPath([
			"/Engineering",
			"/Product",
		])).toBe("/Engineering")
	})
})
