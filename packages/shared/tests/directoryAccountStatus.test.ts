import { describe, expect, it } from "vitest"

import { directoryAccountStatus } from "../src/directoryFixtures"

describe("directoryAccountStatus", () => {
	it("is Active unless Google has suspended or archived the user", () => {
		expect(directoryAccountStatus({})).toBe("Active")
		expect(directoryAccountStatus({ suspended: false, archived: false })).toBe("Active")
	})

	it("reports Suspended when the user is suspended", () => {
		expect(directoryAccountStatus({ suspended: true })).toBe("Suspended")
	})

	it("reports Archived ahead of Suspended", () => {
		expect(directoryAccountStatus({ archived: true, suspended: true })).toBe("Archived")
	})
})
