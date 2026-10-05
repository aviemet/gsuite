import { Autocomplete, Button, Group, Stack, Text, TextInput, Title } from "@mantine/core"
import { type ChangeEvent, useState } from "react"

import { useAuth } from "@/frontend/hooks/useAuth"
import { useDirectoryQuery } from "@/frontend/queries/directory"
import {
	useAcceptInvite,
	useConnectWorkspace,
	useSetWorkspaceAdmin,
	useWorkspaceQuery,
} from "@/frontend/queries/workspace"
import { type DirectoryUser } from "@/shared/directoryFixtures"
import { membershipRoles } from "@/shared/workspace"

import { notifySettingsError, notifySettingsSuccess } from "../notifySettingsError"

function directoryUserLabel(directoryUser: DirectoryUser): string {
	return `${ directoryUser.displayName } (${ directoryUser.email })`
}

export function WorkspaceAdminPanel() {
	const { user } = useAuth()
	const workspace = useWorkspaceQuery()
	const connect = useConnectWorkspace()
	const setAdmin = useSetWorkspaceAdmin()
	const accept = useAcceptInvite()
	const [adminEmail, setAdminEmail] = useState<string | undefined>(undefined)
	const [search, setSearch] = useState("")
	const [selectedEmail, setSelectedEmail] = useState("")

	const session = workspace.data
	const customer = session?.customer ?? null
	const isOwner = session?.membership?.role === membershipRoles.owner
	const directory = useDirectoryQuery({ enabled: Boolean(customer) })
	const connectEmail = adminEmail ?? user?.email ?? ""
	const adminOptions = (directory.data?.users ?? []).map((directoryUser) => ({
		value: directoryUser.email,
		label: directoryUserLabel(directoryUser),
	}))
	const selectedOption = adminOptions.find((option) => option.value === selectedEmail)
	const canSetAdmin = selectedOption?.label === search

	function handleConnectEmailChange(event: ChangeEvent<HTMLInputElement>) {
		setAdminEmail(event.currentTarget.value)
	}

	function handleAdminSearchChange(value: string) {
		setSearch(value)
	}

	function handleAdminSelect(email: string) {
		setSelectedEmail(email)
	}

	function handleConnect() {
		connect.mutate({ workspaceAdminEmail: connectEmail }, {
			onSuccess: () => notifySettingsSuccess("Workspace connected"),
			onError: (error) => notifySettingsError(error, "Failed to connect Workspace"),
		})
	}

	function handleSaveAdmin() {
		if(!canSetAdmin) return
		setAdmin.mutate({ workspaceAdminEmail: selectedEmail }, {
			onSuccess: () => notifySettingsSuccess("Workspace admin updated"),
			onError: (error) => notifySettingsError(error, "Failed to update the Workspace admin"),
		})
	}

	function handleAcceptInvite() {
		accept.mutate({}, {
			onSuccess: () => notifySettingsSuccess("Invite accepted"),
			onError: (error) => notifySettingsError(error, "Invite not found"),
		})
	}

	if(!session) return null

	return (
		<Stack gap="sm">
			<Title order={ 2 } size="h4">Workspace admin</Title>
			<Text>
				The Workspace admin account authenticates all Google API calls made within Signature Manager. We recommend a dedicated account in your domain with Super Admin access, in an organizational unit where the services this app uses are turned on. This ensures uninterrupted service within Signature Manager.
			</Text>
			{ customer
				? (
					<Stack gap="sm">
						<TextInput
							label="Current Workspace admin"
							description="Google API calls authenticate as this account."
							value={ customer.workspaceAdminEmail }
							readOnly
						/>
						{ isOwner
							? (
								<>
									<Autocomplete
										label="Change Workspace admin"
										description="Select a Super Admin from your directory. Signature Manager will authenticate Google API calls as that account."
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
				)
				: (
					<Stack gap="sm">
						<TextInput
							label="Workspace admin email"
							description="Enter a Super Admin in your domain. Signature Manager will authenticate Google API calls as this account."
							value={ connectEmail }
							onChange={ handleConnectEmailChange }
						/>
						<Group>
							<Button loading={ connect.isPending } onClick={ handleConnect }>
								Connect
							</Button>
							<Button variant="default" loading={ accept.isPending } onClick={ handleAcceptInvite }>
								Accept invite
							</Button>
						</Group>
					</Stack>
				) }
		</Stack>
	)
}
