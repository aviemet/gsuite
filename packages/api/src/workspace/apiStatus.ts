import { apiStatusCheckIds, type ApiStatusResult } from "@gsuite/shared"

import { type DirectoryClient } from "../directory/client"
import { type GmailClient } from "../gmail/client"

function errorText(error: unknown): string {
	if(error instanceof Error && error.message) return error.message
	return "Check failed"
}

export async function checkApiStatus(
	directory: DirectoryClient,
	gmail: GmailClient,
	userEmail: string,
): Promise<ApiStatusResult[]> {
	const checks: Array<{
		id: ApiStatusResult["id"]
		label: string
		group: ApiStatusResult["group"]
		run: () => Promise<void>
	}> = [
		{
			id: apiStatusCheckIds.users,
			label: "Users",
			group: "admin",
			run: () => directory.checkUsers(),
		},
		{
			id: apiStatusCheckIds.groups,
			label: "Groups",
			group: "admin",
			run: () => directory.checkGroups(),
		},
		{
			id: apiStatusCheckIds.organizationalUnits,
			label: "Organizational units",
			group: "admin",
			run: () => directory.checkOrganizationalUnits(),
		},
		{
			id: apiStatusCheckIds.gmailSettings,
			label: "Gmail signature settings",
			group: "user",
			run: () => gmail.probeSignatureSettings(userEmail),
		},
	]

	const results: ApiStatusResult[] = []
	for(const check of checks) {
		try {
			await check.run()
			results.push({
				id: check.id,
				label: check.label,
				group: check.group,
				status: "success",
			})
		} catch (error) {
			results.push({
				id: check.id,
				label: check.label,
				group: check.group,
				status: "error",
				error: errorText(error),
			})
		}
	}
	return results
}
