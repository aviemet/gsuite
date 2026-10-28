import { Autocomplete, Button, Stack, Text, TextInput, Title } from "@mantine/core"
import { useState } from "react"

import { APP_NAME } from "@/frontend/lib/appName"
import { useDirectoryQuery } from "@/frontend/queries/directory"
import {
	useSetWorkspaceAdmin,
	useWorkspaceQuery,
} from "@/frontend/queries/workspace"
import { type DirectoryUser } from "@/shared/directoryFixtures"
import { canManageWorkspaceSettings } from "@/shared/workspace"

import { notifySettingsError, notifySettingsSuccess } from "../notifySettingsError"

function directoryUserLabel(directoryUser: DirectoryUser): string {
	return `${ directoryUser.displayName } (${ directoryUser.email })`
}

export function WorkspaceAdminPanel() {
	const workspace = useWorkspaceQuery()
	const setAdmin = useSetWorkspaceAdmin()
	const [search, setSearch] = useState("")
	const [selectedEmail, setSelectedEmail] = useState("")

	const session = workspace.data
	const customer = session?.customer ?? null
	const canManageAdmin = session?.membership
		? canManageWorkspaceSettings(session.membership.role)
		: false
	const directory = useDirectoryQuery({ enabled: Boolean(customer) && canManageAdmin })
	const adminOptions = (directory.data?.users ?? []).map((directoryUser) => ({
		value: directoryUser.email,
		label: directoryUserLabel(directoryUser),
	}))
	const selectedOption = adminOptions.find((option) => option.value === selectedEmail)
	const canSetAdmin = selectedOption?.label === search

	function handleAdminSearchChange(value: string) {
		setSearch(value)
	}

	function handleAdminSelect(email: string) {
		setSelectedEmail(email)
	}

	function handleSaveAdmin() {
		if(!canSetAdmin) return
		setAdmin.mutate({ workspaceAdminEmail: selectedEmail }, {
			onSuccess: () => notifySettingsSuccess("Workspace admin updated"),
			onError: (error) => notifySettingsError(error, "Failed to update the Workspace admin"),
		})
	}

	if(!customer) return null

	return (
		<Stack gap="sm">
			<Title order={ 2 } size="h4">Workspace admin</Title>
			<Text>
				The Workspace admin account authenticates all Google API calls made within { APP_NAME }. We recommend a dedicated account in your domain with Super Admin access, in an organizational unit where the services this app uses are turned on. This ensures uninterrupted service within { APP_NAME }.
			</Text>
			<Stack gap="sm">
				<TextInput
					label="Current Workspace admin"
					description="Google API calls authenticate as this account."
					value={ customer.workspaceAdminEmail }
					readOnly
				/>
				{ canManageAdmin
					? (
						<>
							<Autocomplete
								label="Change Workspace admin"
								description={ `Select a Super Admin from your directory. ${ APP_NAME } will authenticate Google API calls as that account.` }
								placeholder="Search by name or email"
								data={ adminOptions }
								value={ search }
								onChange={ handleAdminSearchChange }
								onOptionSubmit={ handleAdminSelect }
								limit={ 8 }
							/>
							<Button
								disabled={ !canSetAdmin || setAdmin.isPending }
								onClick={ handleSaveAdmin }
							>
								Set Workspace admin
							</Button>
						</>
					)
					: null }
			</Stack>
		</Stack>
	)
}
