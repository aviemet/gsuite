import { describe, expect, it } from "vitest"

import { parseUserSettings } from "@/frontend/lib/tableView/parseUserSettings"

describe("parseUserSettings", () => {
	it("returns defaults for missing documents", () => {
		expect(parseUserSettings(undefined)).toEqual({
			tableViews: {},
			defaultTableRecordLimit: 25,
			updatedAt: "1970-01-01T00:00:00.000Z",
		})
	})

	it("parses table views and preserves the default record limit", () => {
		expect(parseUserSettings({
			defaultTableRecordLimit: 50,
			updatedAt: "2026-01-01T00:00:00.000Z",
			tableViews: {
				"directory.users": {
					visibleColumnIds: ["email", "displayName"],
					recordLimit: 10,
				},
				broken: {
					visibleColumnIds: ["email"],
				},
			},
		})).toEqual({
			defaultTableRecordLimit: 50,
			updatedAt: "2026-01-01T00:00:00.000Z",
			tableViews: {
				"directory.users": {
					visibleColumnIds: ["email", "displayName"],
					recordLimit: 10,
				},
			},
		})
	})
})
