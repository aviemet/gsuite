import { Alert, Button, Loader, Stack, Text, Title } from "@mantine/core"
import { useState } from "react"

import { useAuth } from "@/frontend/hooks/useAuth"
import { APP_NAME } from "@/frontend/lib/appName"
import { useConnectWorkspace, useWorkspaceQuery } from "@/frontend/queries/workspace"
import { isWorkspaceNotInstalledMessage } from "@/shared/workspace"

import * as classes from "../ApiStatusPanel/ApiStatusPanel.css"
import { MarketplaceInstall } from "../MarketplaceInstall"
import { notifySettingsSuccess } from "../notifySettingsError"

function connectErrorMessage(error: unknown): string {
	if(error instanceof Error && error.message) return error.message
	return "Failed to connect Workspace"
}

export function ConnectWorkspacePanel() {
	const { user } = useAuth()
	const workspace = useWorkspaceQuery()
	const connect = useConnectWorkspace()
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
	const signedInEmail = user?.email ?? ""
	const isInstallPending = errorMessage
		? isWorkspaceNotInstalledMessage(errorMessage)
		: false

	function handleConnect() {
		setErrorMessage(undefined)
		connect.mutate({}, {
			onSuccess: () => notifySettingsSuccess("Workspace connected"),
			onError: (error) => setErrorMessage(connectErrorMessage(error)),
		})
	}

	if(workspace.isPending) return <Loader />

	if(workspace.isError) {
		return <Alert color="red">{ workspace.error.message }</Alert>
	}

	const marketplaceUrl = workspace.data?.marketplaceUrl ?? ""

	return (
		<Stack gap="lg">
			<Stack gap="sm">
				<Title order={ 2 } size="h4">Connect Workspace</Title>
				<Text>
					Link { APP_NAME } to your Google Workspace in two steps. Install the app from the Google Workspace Marketplace first, then connect with the Super Admin account you are signed in as.
				</Text>
			</Stack>

			<MarketplaceInstall marketplaceUrl={ marketplaceUrl } stepLabel="Step 1" />

			<Stack gap="sm" className={ classes.section }>
				<Title order={ 2 } size="h4">Step 2: Connect as { signedInEmail || "your Super Admin account" }</Title>
				<Text>
					Directory and Gmail calls will authenticate as this account. Prefer an account in an organizational unit where Directory and Gmail are turned on.
				</Text>
				{ errorMessage
					? (
						<Alert color="red" title={ isInstallPending ? "Installation is not finished" : "Could not connect" }>
							{ errorMessage }
							{ isInstallPending
								? " Use the Install button in Step 1, then try Connect again."
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
