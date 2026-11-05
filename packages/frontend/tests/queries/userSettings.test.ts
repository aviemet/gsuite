import { describe, expect, it } from "vitest"

import { parseUserSettings } from "@/frontend/lib/tableView"

describe("userSettings persistence shape", () => {
	it("keeps defaultTableRecordLimit when merging a view write payload conceptually", () => {
		const current = parseUserSettings({
			defaultTableRecordLimit: 50,
			updatedAt: "2026-01-01T00:00:00.000Z",
			tableViews: {},
		})

		const nextView = {
			visibleColumnIds: ["email"],
			recordLimit: 10 as const,
		}

		expect({
			...current,
			tableViews: {
				...current.tableViews,
				"directory.users": nextView,
			},
		}).toMatchObject({
			defaultTableRecordLimit: 50,
			tableViews: {
				"directory.users": nextView,
			},
		})
	})
})
