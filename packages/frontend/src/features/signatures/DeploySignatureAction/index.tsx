import { ActionIcon, Tooltip } from "@mantine/core"
import { IconRocket } from "@tabler/icons-react"
import { useMemo, useState } from "react"

import { DeployConfirmModal } from "@/frontend/features/signatures/DeployConfirmModal"
import { deploySignatureTemplate } from "@/frontend/features/signatures/deploySignatureTemplate"
import { listTemplateRecipientEmails } from "@/frontend/features/signatures/listTemplateRecipients"
import {
	notifyDeployError,
	notifyDeploySuccess,
} from "@/frontend/features/signatures/notifyDeployResult"
import { useDirectoryQuery } from "@/frontend/queries/directory"
import { useTemplateAssignmentsQuery, useTemplatesQuery } from "@/frontend/queries/templates"

interface DeploySignatureActionProps {
	templateId: string
	templateName: string
}

export function DeploySignatureAction({
	templateId,
	templateName,
}: DeploySignatureActionProps) {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isDeploying, setIsDeploying] = useState(false)
	const { data: templates = [] } = useTemplatesQuery()
	const { data: assignments = [] } = useTemplateAssignmentsQuery()
	const { data: directory } = useDirectoryQuery()

	const recipients = useMemo(() => {
		if(!directory) return []
		return listTemplateRecipientEmails(
			templateId,
			templates,
			assignments,
			directory.users,
		)
	}, [templateId, templates, assignments, directory])

	function handleOpenConfirm() {
		setIsConfirmOpen(true)
	}

	function handleCancel() {
		if(isDeploying) return
		setIsConfirmOpen(false)
	}

	async function handleConfirmDeploy() {
		setIsDeploying(true)
		try {
			const result = await deploySignatureTemplate(templateId)
			notifyDeploySuccess(result.queuedUserCount)
			setIsConfirmOpen(false)
		} catch (error) {
			notifyDeployError(error)
		} finally {
			setIsDeploying(false)
		}
	}

	return (
		<>
			<Tooltip label="Deploy" withArrow position="top">
				<ActionIcon
					variant="subtle"
					color="harbor"
					size="sm"
					aria-label={ `Deploy ${ templateName }` }
					onClick={ handleOpenConfirm }
				>
					<IconRocket size={ 16 } aria-hidden />
				</ActionIcon>
			</Tooltip>
			<DeployConfirmModal
				opened={ isConfirmOpen }
				templateName={ templateName }
				recipients={ recipients }
				isDeploying={ isDeploying }
				onConfirm={ handleConfirmDeploy }
				onCancel={ handleCancel }
			/>
		</>
	)
}
