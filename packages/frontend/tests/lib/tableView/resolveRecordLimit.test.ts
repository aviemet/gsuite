import { describe, expect, it } from "vitest"

import { resolveRecordLimit } from "@/frontend/lib/tableView/resolveRecordLimit"

describe("resolveRecordLimit", () => {
	it("prefers the view record limit", () => {
		expect(resolveRecordLimit(
			{ visibleColumnIds: ["name"], recordLimit: 50 },
			{ defaultTableRecordLimit: 10 },
		)).toBe(50)
	})

	it("falls back to the user default when the view has no limit", () => {
		expect(resolveRecordLimit(undefined, { defaultTableRecordLimit: 100 })).toBe(100)
	})

	it("falls back to 25 when neither is set", () => {
		expect(resolveRecordLimit(undefined, undefined)).toBe(25)
	})
})
