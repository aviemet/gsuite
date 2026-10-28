import { Alert, Loader, Paper, Tabs } from "@mantine/core"
import { IconActivity, IconShield, IconUsers } from "@tabler/icons-react"
import { useState } from "react"

import { ApiStatusTab } from "@/frontend/features/settings/ApiStatusTab"
import { ConnectWorkspacePanel } from "@/frontend/features/settings/ConnectWorkspacePanel"
import { PermissionsPanel } from "@/frontend/features/settings/PermissionsPanel"
import { WorkspaceAdminPanel } from "@/frontend/features/settings/WorkspaceAdminPanel"
import { useMembershipQuery, useWorkspaceQuery } from "@/frontend/queries"

const settingsTabs = ["workspace", "api-status", "permissions"] as const

type SettingsTab = typeof settingsTabs[number]

function isSettingsTab(value: string | null): value is SettingsTab {
	return settingsTabs.some((tab) => tab === value)
}

export function WorkspaceSettings() {
	const membership = useMembershipQuery()
	const hasMembership = Boolean(membership.data)
	const workspace = useWorkspaceQuery({ enabled: hasMembership })
	const [tab, setTab] = useState<SettingsTab>("workspace")

	function handleTabChange(value: string | null) {
		if(isSettingsTab(value)) setTab(value)
	}

	if(membership.isPending) {
		return <Loader />
	}

	if(membership.isError) {
		return <Alert color="red">{ membership.error.message }</Alert>
	}

	if(!hasMembership) {
		return (
			<Paper withBorder p="md">
				<Tabs value="workspace" keepMounted={ false }>
					<Tabs.List mb="md">
						<Tabs.Tab value="workspace" leftSection={ <IconShield size={ 16 } /> }>
							Workspace
						</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value="workspace">
						<ConnectWorkspacePanel />
					</Tabs.Panel>
				</Tabs>
			</Paper>
		)
	}

	if(workspace.isLoading) {
		return <Loader />
	}

	if(workspace.error) {
		return <Alert color="red">{ workspace.error.message }</Alert>
	}

	if(!workspace.data) return null

	return (
		<Paper withBorder p="md">
			<Tabs value={ tab } onChange={ handleTabChange } keepMounted={ false }>
				<Tabs.List mb="md">
					<Tabs.Tab value="workspace" leftSection={ <IconShield size={ 16 } /> }>
						Workspace
					</Tabs.Tab>
					<Tabs.Tab value="api-status" leftSection={ <IconActivity size={ 16 } /> }>
						API status
					</Tabs.Tab>
					<Tabs.Tab value="permissions" leftSection={ <IconUsers size={ 16 } /> }>
						Permissions
					</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="workspace">
					<WorkspaceAdminPanel />
				</Tabs.Panel>
				<Tabs.Panel value="api-status">
					<ApiStatusTab />
				</Tabs.Panel>
				<Tabs.Panel value="permissions">
					<PermissionsPanel />
				</Tabs.Panel>
			</Tabs>
		</Paper>
	)
}
