import { Alert, Stack } from "@mantine/core"
import { useState } from "react"

import { useWorkspaceQuery } from "@/frontend/queries/workspace"

import { ApiStatusPanel } from "../ApiStatusPanel"
import { apiStatusNeedsAuthorization, buildApiStatusRows } from "../ApiStatusPanel/apiStatusRows"
import { DelegationSetup } from "../DelegationSetup"
import { useAutomaticApiStatus } from "./useAutomaticApiStatus"

function requestErrorMessage(error: unknown): string | undefined {
	if(error instanceof Error && error.message) return error.message
	if(error) return "Failed to check Google APIs"
	return undefined
}

export function ApiStatusTab() {
	const workspace = useWorkspaceQuery()
	const customer = workspace.data?.customer ?? null
	const [mailbox, setMailbox] = useState(customer?.workspaceAdminEmail ?? "")
	const apiStatus = useAutomaticApiStatus(customer?.workspaceAdminEmail)
	const isChecking = Boolean(customer) && (apiStatus.isPending || (!apiStatus.data && !apiStatus.isError))
	const requestError = apiStatus.isError ? requestErrorMessage(apiStatus.error) : undefined
	const rows = buildApiStatusRows(apiStatus.data?.results, isChecking, requestError)

	function handleCheck(userEmail: string) {
		apiStatus.check(userEmail)
	}

	if(!customer || !workspace.data) {
		return <Alert>Connect a Workspace domain on the Workspace tab before checking APIs.</Alert>
	}

	return (
		<Stack gap="lg">
			<ApiStatusPanel
				userEmail={ mailbox }
				isChecking={ isChecking }
				results={ apiStatus.data?.results }
				requestError={ requestError }
				onUserEmailChange={ setMailbox }
				onCheck={ handleCheck }
			/>
			{ apiStatusNeedsAuthorization(rows)
				? <DelegationSetup
					clientId={ workspace.data.clientId }
					scopes={ workspace.data.scopes }
				/>
				: null }
		</Stack>
	)
}
