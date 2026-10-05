import {
	type ApiStatusCheckId,
	apiStatusCheckIds,
	type ApiStatusGroup,
	type ApiStatusResult,
} from "@/shared/workspace"

export const apiStatusCatalog: ReadonlyArray<{
	id: ApiStatusCheckId
	label: string
	group: ApiStatusGroup
}> = [
	{ id: apiStatusCheckIds.users, label: "Users", group: "admin" },
	{ id: apiStatusCheckIds.groups, label: "Groups", group: "admin" },
	{ id: apiStatusCheckIds.organizationalUnits, label: "Organizational units", group: "admin" },
	{ id: apiStatusCheckIds.gmailSettings, label: "Gmail signature settings", group: "user" },
]

export type ApiStatusRowState = "idle" | "checking" | "success" | "error"

export interface ApiStatusRow {
	id: ApiStatusCheckId
	label: string
	group: ApiStatusGroup
	state: ApiStatusRowState
	error?: string
}

export function buildApiStatusRows(
	results: readonly ApiStatusResult[] | undefined,
	isChecking: boolean,
	requestError?: string,
): ApiStatusRow[] {
	if(requestError && !isChecking) {
		return apiStatusCatalog.map((check) => ({
			id: check.id,
			label: check.label,
			group: check.group,
			state: "error",
			error: requestError,
		}))
	}

	const resultsById = new Map<ApiStatusCheckId, ApiStatusResult>()
	for(const result of results ?? []) {
		resultsById.set(result.id, result)
	}

	return apiStatusCatalog.map((check) => {
		if(isChecking) {
			return {
				id: check.id,
				label: check.label,
				group: check.group,
				state: "checking",
			}
		}

		const result = resultsById.get(check.id)
		if(!result) {
			return {
				id: check.id,
				label: check.label,
				group: check.group,
				state: "idle",
			}
		}

		if(result.status === "success") {
			return {
				id: check.id,
				label: result.label,
				group: result.group,
				state: "success",
			}
		}

		return {
			id: check.id,
			label: result.label,
			group: result.group,
			state: "error",
			error: result.error,
		}
	})
}

export function summarizeApiStatus(rows: readonly ApiStatusRow[]): ApiStatusRowState {
	if(rows.some((row) => row.state === "checking")) return "checking"
	if(rows.length > 0 && rows.every((row) => row.state === "success")) return "success"
	if(rows.some((row) => row.state === "error")) return "error"
	return "idle"
}

export function apiStatusRowMessage(row: ApiStatusRow): string {
	if(row.state === "checking") return "Checking"
	if(row.state === "success") return "Ready"
	if(row.state === "error") return row.error ?? "Failed"
	return "Not checked"
}

export function apiStatusNeedsAuthorization(rows: readonly ApiStatusRow[]): boolean {
	return rows.some((row) => row.state === "error")
}

export function apiStatusSummaryMessage(state: ApiStatusRowState): string {
	if(state === "checking") return "Checking Google APIs"
	if(state === "success") return "All APIs are available"
	if(state === "error") return "Some APIs need attention"
	return "Not checked yet"
}
