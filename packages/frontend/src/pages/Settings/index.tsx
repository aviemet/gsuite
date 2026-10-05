import { Container } from "@mantine/core"

import { Page } from "@/frontend/components/Page"
import { WorkspaceSettings } from "@/frontend/features/settings/WorkspaceSettings"

export function SettingsPage() {
	return (
		<Page title="Settings">
			<Container>
				<WorkspaceSettings />
			</Container>
		</Page>
	)
}
