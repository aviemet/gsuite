import { Alert, Button, Loader, Stack, Text, TextInput, Title } from "@mantine/core"
import { type ChangeEvent, useState } from "react"

import { useAuth } from "@/frontend/hooks/useAuth"
import { APP_NAME } from "@/frontend/lib/appName"
import { useConnectWorkspace, useWorkspaceQuery } from "@/frontend/queries/workspace"
import { isWorkspaceDelegationUnauthorizedMessage } from "@/shared/workspace"

import * as classes from "../ApiStatusPanel/ApiStatusPanel.css"
import { DelegationSetup } from "../DelegationSetup"
import { notifySettingsSuccess } from "../notifySettingsError"

function connectErrorMessage(error: unknown): string {
	if(error instanceof Error && error.message) return error.message
	return "Failed to connect Workspace"
}

export function ConnectWorkspacePanel() {
	const { user } = useAuth()
	const workspace = useWorkspaceQuery()
	const connect = useConnectWorkspace()
	const [adminEmail, setAdminEmail] = useState<string | undefined>(undefined)
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
	const connectEmail = adminEmail ?? user?.email ?? ""
	const isDelegationError = errorMessage
		? isWorkspaceDelegationUnauthorizedMessage(errorMessage)
		: false

	function handleConnectEmailChange(event: ChangeEvent<HTMLInputElement>) {
		setAdminEmail(event.currentTarget.value)
		setErrorMessage(undefined)
	}

	function handleConnect() {
		setErrorMessage(undefined)
		connect.mutate({ workspaceAdminEmail: connectEmail }, {
			onSuccess: () => notifySettingsSuccess("Workspace connected"),
			onError: (error) => setErrorMessage(connectErrorMessage(error)),
		})
	}

	if(workspace.isPending) return <Loader />

	if(workspace.isError) {
		return <Alert color="red">{ workspace.error.message }</Alert>
	}

	const clientId = workspace.data?.clientId ?? ""
	const scopes = workspace.data?.scopes ?? []

	return (
		<Stack gap="lg">
			<Stack gap="sm">
				<Title order={ 2 } size="h4">Connect Workspace</Title>
				<Text>
					Link { APP_NAME } to your Google Workspace in two steps. Authorize the app in Google Admin first, then connect with a Super Admin email from your domain.
				</Text>
			</Stack>

			<DelegationSetup clientId={ clientId } scopes={ scopes } stepLabel="Step 1" />

			<Stack gap="sm" className={ classes.section }>
				<Title order={ 2 } size="h4">Step 2: Connect with a Super Admin email</Title>
				<Text>
					Enter a Super Admin from your domain. Directory and Gmail calls will authenticate as that account. Prefer an account in an organizational unit where Directory and Gmail are turned on.
				</Text>
				<TextInput
					label="Workspace admin email"
					description="Must be a Workspace Super Admin on your domain."
					value={ connectEmail }
					onChange={ handleConnectEmailChange }
				/>
				{ errorMessage
					? (
						<Alert color="red" title={ isDelegationError ? "Authorization is not finished" : "Could not connect" }>
							{ errorMessage }
							{ isDelegationError
								? " Use the Client ID and scopes in Step 1, then try Connect again."
								: null }
						</Alert>
					)
					: null }
				<Button loading={ connect.isPending } onClick={ handleConnect }>
					Connect
				</Button>
			</Stack>
		</Stack>
	)
}
