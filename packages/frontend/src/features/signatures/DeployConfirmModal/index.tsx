import { Button, Group, Modal, Stack, Text } from "@mantine/core"

import { DeployRecipientsList } from "@/frontend/features/signatures/DeployRecipientsList"
import { type TemplateRecipient } from "@/frontend/features/signatures/listTemplateRecipients"

interface DeployConfirmModalProps {
	opened: boolean
	templateName: string
	recipients: readonly TemplateRecipient[]
	isDeploying: boolean
	onConfirm: () => void
	onCancel: () => void
}

export function DeployConfirmModal({
	opened,
	templateName,
	recipients,
	isDeploying,
	onConfirm,
	onCancel,
}: DeployConfirmModalProps) {
	return (
		<Modal
			opened={ opened }
			onClose={ onCancel }
			title={ `Deploy ${templateName}?` }
			centered
			transitionProps={ { duration: 0 } }
		>
			<Stack gap="md">
				<Text size="sm">
					Review the mailboxes that will receive this signature, then confirm.
				</Text>
				<DeployRecipientsList recipients={ recipients } />
				<Group justify="flex-end">
					<Button variant="default" onClick={ onCancel } disabled={ isDeploying }>
						Cancel
					</Button>
					<Button onClick={ onConfirm } loading={ isDeploying }>
						Deploy
					</Button>
				</Group>
			</Stack>
		</Modal>
	)
}
