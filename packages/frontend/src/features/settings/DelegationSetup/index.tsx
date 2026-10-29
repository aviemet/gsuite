import {
	Anchor,
	Button,
	CopyButton,
	Group,
	List,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
} from "@mantine/core"

import { APP_NAME } from "@/frontend/lib/appName"
import {
	WORKSPACE_DELEGATION_ADMIN_URL,
	workspaceScopesForAdminConsole,
} from "@/shared/workspace"

import * as classes from "../ApiStatusPanel/ApiStatusPanel.css"

interface DelegationSetupProps {
	clientId: string
	scopes: readonly string[]
	stepLabel?: string
}

export function DelegationSetup({
	clientId,
	scopes,
	stepLabel,
}: DelegationSetupProps) {
	const scopeText = workspaceScopesForAdminConsole(scopes)
	const hasClientId = clientId.trim().length > 0
	const title = stepLabel
		? `${ stepLabel }: Authorize ${ APP_NAME } in Google Admin`
		: `Authorize ${ APP_NAME } in Google Admin`

	return (
		<Stack gap="sm" className={ classes.section }>
			<Title order={ 2 } size="h4">{ title }</Title>
			<Text>
				{ APP_NAME } needs permission from your Workspace before it can read your directory or set Gmail signatures. A Super Admin does this once for the whole company.
			</Text>
			<List type="ordered" spacing="xs">
				<List.Item>
					Open{ " " }
					<Anchor href={ WORKSPACE_DELEGATION_ADMIN_URL } target="_blank" rel="noreferrer">
						Domain-wide delegation
					</Anchor>
					{ " " }
					in Google Admin (Security → Access and data control → API controls → Domain-wide delegation).
				</List.Item>
				<List.Item>Click Add new.</List.Item>
				<List.Item>Paste the Client ID below.</List.Item>
				<List.Item>
					Paste the scopes below into OAuth scopes. Google expects them comma-separated; the copy button formats them that way.
				</List.Item>
				<List.Item>Click Authorize. If your Workspace requires a second Super Admin approval, finish that first.</List.Item>
				<List.Item>Wait about a minute for Google to apply the change, then continue.</List.Item>
			</List>
			{ hasClientId
				? (
					<>
						<TextInput
							label="Client ID"
							description="Paste this into the Client ID field."
							value={ clientId }
							readOnly
						/>
						<Textarea
							label="OAuth scopes"
							description="Paste this into the OAuth scopes field."
							value={ scopeText }
							readOnly
							rows={ Math.max(scopes.length, 2) }
						/>
						<Group>
							<CopyButton value={ clientId }>
								{ ({ copied, copy }) => (
									<Button variant="light" onClick={ copy }>
										{ copied ? "Client ID copied" : "Copy client ID" }
									</Button>
								) }
							</CopyButton>
							<CopyButton value={ scopeText }>
								{ ({ copied, copy }) => (
									<Button variant="light" onClick={ copy }>
										{ copied ? "Scopes copied" : "Copy scopes" }
									</Button>
								) }
							</CopyButton>
							<Button
								component="a"
								href={ WORKSPACE_DELEGATION_ADMIN_URL }
								target="_blank"
								rel="noreferrer"
								variant="default"
							>
								Open Google Admin
							</Button>
						</Group>
					</>
				)
				: (
					<Text c="red">
						The Client ID is missing from this deployment. Ask whoever hosts { APP_NAME } to configure the Workspace service account, then reload this page.
					</Text>
				) }
		</Stack>
	)
}
