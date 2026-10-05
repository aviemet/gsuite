import { Button, CopyButton, Group, Stack, Text, Textarea, TextInput, Title } from "@mantine/core"

import * as classes from "../ApiStatusPanel/ApiStatusPanel.css"

interface DelegationSetupProps {
	clientId: string
	scopes: readonly string[]
}

export function DelegationSetup({ clientId, scopes }: DelegationSetupProps) {
	const scopeText = scopes.join("\n")

	return (
		<Stack gap="sm" className={ classes.section }>
			<Title order={ 2 } size="h4">Authorize Signature Manager</Title>
			<Text>
				A check failed, so Google has not granted this app access yet. In the Admin console, open Security, then Access and data control, then API controls, then Domain-wide delegation. Add the client ID, paste the scopes, then check again.
			</Text>
			<TextInput
				label="Client ID"
				description="Paste this into Domain-wide delegation."
				value={ clientId }
				readOnly
			/>
			<Textarea
				label="Scopes"
				description="Paste these on the same delegation entry."
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
			</Group>
		</Stack>
	)
}
