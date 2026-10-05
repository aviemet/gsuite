import { describe, expect, it } from "vitest"

import {
	apiStatusNeedsAuthorization,
	apiStatusRowMessage,
	apiStatusSummaryMessage,
	buildApiStatusRows,
	summarizeApiStatus,
} from "@/frontend/features/settings/ApiStatusPanel/apiStatusRows"
import { apiStatusCheckIds, type ApiStatusResult } from "@/shared/workspace"

const successResults: ApiStatusResult[] = [
	{ id: apiStatusCheckIds.users, label: "Users", group: "admin", status: "success" },
	{ id: apiStatusCheckIds.groups, label: "Groups", group: "admin", status: "success" },
	{ id: apiStatusCheckIds.organizationalUnits, label: "Organizational units", group: "admin", status: "success" },
	{ id: apiStatusCheckIds.gmailSettings, label: "Gmail signature settings", group: "user", status: "success" },
]

describe("buildApiStatusRows", () => {
	it("keeps every check idle until a run starts", () => {
		const rows = buildApiStatusRows(undefined, false)

		expect(rows.map((row) => row.state)).toEqual(["idle", "idle", "idle", "idle"])
		expect(apiStatusSummaryMessage(summarizeApiStatus(rows))).toBe("Not checked yet")
		expect(apiStatusRowMessage(rows[0])).toBe("Not checked")
	})

	it("marks every check as running while the request is in flight", () => {
		const rows = buildApiStatusRows(successResults, true)

		expect(rows.every((row) => row.state === "checking")).toBe(true)
		expect(summarizeApiStatus(rows)).toBe("checking")
	})

	it("records success and failure on each check", () => {
		const results: ApiStatusResult[] = [
			...successResults.slice(0, 3),
			{
				id: apiStatusCheckIds.gmailSettings,
				label: "Gmail signature settings",
				group: "user",
				status: "error",
				error: "Delegation denied",
			},
		]
		const rows = buildApiStatusRows(results, false)
		const gmail = rows.find((row) => row.id === apiStatusCheckIds.gmailSettings)

		expect(summarizeApiStatus(rows)).toBe("error")
		expect(gmail?.state).toBe("error")
		expect(gmail ? apiStatusRowMessage(gmail) : "").toBe("Delegation denied")
		expect(apiStatusSummaryMessage("success")).toBe("All APIs are available")
		expect(apiStatusNeedsAuthorization(rows)).toBe(true)
		expect(apiStatusNeedsAuthorization(buildApiStatusRows(successResults, false))).toBe(false)
	})

	it("fails every check when the status request itself fails", () => {
		const rows = buildApiStatusRows(undefined, false, "Failed to check Google APIs")

		expect(rows.every((row) => row.state === "error")).toBe(true)
		expect(apiStatusNeedsAuthorization(rows)).toBe(true)
		expect(rows[0] ? apiStatusRowMessage(rows[0]) : "").toBe("Failed to check Google APIs")
	})
})
