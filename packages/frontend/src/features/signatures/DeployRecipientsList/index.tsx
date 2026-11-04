import { ScrollArea, Stack, Text } from "@mantine/core"

import { type TemplateRecipient } from "@/frontend/features/signatures/listTemplateRecipients"

interface DeployRecipientsListProps {
	recipients: readonly TemplateRecipient[]
}

function mailboxCountLabel(count: number) {
	if(count === 1) return "Will apply to 1 mailbox"
	return `Will apply to ${count} mailboxes`
}

export function DeployRecipientsList({ recipients }: DeployRecipientsListProps) {
	return (
		<Stack gap="xs">
			<Text size="sm" fw={ 500 }>
				{ mailboxCountLabel(recipients.length) }
			</Text>
			{ recipients.length === 0
				? (
					<Text size="sm" c="dimmed">
						No mailboxes currently match
					</Text>
				)
				: (
					<ScrollArea.Autosize mah={ 220 } type="auto" offsetScrollbars>
						<Stack gap={ 4 }>
							{ recipients.map((recipient) => (
								<Text key={ recipient.email } size="sm">
									{ recipient.displayName }
									{ " " }
									<Text span c="dimmed">
										{ `(${recipient.email})` }
									</Text>
								</Text>
							)) }
						</Stack>
					</ScrollArea.Autosize>
				) }
		</Stack>
	)
}
