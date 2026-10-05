import { Alert, Loader, Paper, Tabs } from "@mantine/core"
import { IconActivity, IconShield, IconUsers } from "@tabler/icons-react"
import { useState } from "react"

import { ApiStatusTab } from "@/frontend/features/settings/ApiStatusTab"
import { MembersPanel } from "@/frontend/features/settings/MembersPanel"
import { WorkspaceAdminPanel } from "@/frontend/features/settings/WorkspaceAdminPanel"
import { useWorkspaceQuery } from "@/frontend/queries"

const settingsTabs = ["workspace", "api-status", "members"] as const

type SettingsTab = typeof settingsTabs[number]

function isSettingsTab(value: string | null): value is SettingsTab {
	return settingsTabs.some((tab) => tab === value)
}

export function WorkspaceSettings() {
	const workspace = useWorkspaceQuery()
	const [tab, setTab] = useState<SettingsTab>("workspace")

	function handleTabChange(value: string | null) {
		if(isSettingsTab(value)) setTab(value)
	}

	if(workspace.isLoading) {
		return <Loader />
	}

	if(workspace.error) {
		return <Alert color="red">{ workspace.error.message }</Alert>
	}

	if(!workspace.data) return null

	return (<Paper withBorder p="md">
		<Tabs value={ tab } onChange={ handleTabChange } keepMounted={ false }>
			<Tabs.List mb="md">
				<Tabs.Tab value="workspace" leftSection={ <IconShield size={ 16 } /> }>
					Workspace
				</Tabs.Tab>
				<Tabs.Tab value="api-status" leftSection={ <IconActivity size={ 16 } /> }>
					API status
				</Tabs.Tab>
				<Tabs.Tab value="members" leftSection={ <IconUsers size={ 16 } /> }>
					Members
				</Tabs.Tab>
			</Tabs.List>
			<Tabs.Panel value="workspace">
				<WorkspaceAdminPanel />
			</Tabs.Panel>
			<Tabs.Panel value="api-status">
				<ApiStatusTab />
			</Tabs.Panel>
			<Tabs.Panel value="members">
				<MembersPanel />
			</Tabs.Panel>
		</Tabs>
	</Paper>
	)
}
