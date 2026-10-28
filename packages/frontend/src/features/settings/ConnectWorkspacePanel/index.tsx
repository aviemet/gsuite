import { Button, Stack, Text, TextInput, Title } from "@mantine/core"
import { type ChangeEvent, useState } from "react"

import { useAuth } from "@/frontend/hooks/useAuth"
import { APP_NAME } from "@/frontend/lib/appName"
import { useConnectWorkspace } from "@/frontend/queries/workspace"

import { notifySettingsError, notifySettingsSuccess } from "../notifySettingsError"

export function ConnectWorkspacePanel() {
	const { user } = useAuth()
	const connect = useConnectWorkspace()
	const [adminEmail, setAdminEmail] = useState<string | undefined>(undefined)
	const connectEmail = adminEmail ?? user?.email ?? ""

	function handleConnectEmailChange(event: ChangeEvent<HTMLInputElement>) {
		setAdminEmail(event.currentTarget.value)
	}

	function handleConnect() {
		connect.mutate({ workspaceAdminEmail: connectEmail }, {
			onSuccess: () => notifySettingsSuccess("Workspace connected"),
			onError: (error) => notifySettingsError(error, "Failed to connect Workspace"),
		})
	}

	return (
		<Stack gap="sm">
			<Title order={ 2 } size="h4">Connect Workspace</Title>
			<Text>
				Link { APP_NAME } to your Google Workspace. Enter a Super Admin email from your domain. Directory and Gmail calls will authenticate as that account.
			</Text>
			<TextInput
				label="Workspace admin email"
				description="Use a Super Admin in an organizational unit where Directory and Gmail are turned on."
				value={ connectEmail }
				onChange={ handleConnectEmailChange }
			/>
			<Button loading={ connect.isPending } onClick={ handleConnect }>
				Connect
			</Button>
		</Stack>
	)
}
