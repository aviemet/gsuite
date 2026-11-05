import { Button, Group, Paper, Stack, Switch, Text } from "@mantine/core"
import { useForm } from "@mantine/form"
import clsx from "clsx"
import { useMemo, useState } from "react"

import { DeployConfirmModal } from "@/frontend/features/signatures/DeployConfirmModal"
import { DeployRecipientsList } from "@/frontend/features/signatures/DeployRecipientsList"
import { listWizardRecipientEmails } from "@/frontend/features/signatures/listTemplateRecipients"
import { buildClaimedTargets } from "@/frontend/features/signatures/SignatureWizard/claimedTargets"
import { TargetsStep } from "@/frontend/features/signatures/SignatureWizard/TargetsStep"
import * as targetClasses from "@/frontend/features/signatures/SignatureWizard/TargetsStep.css"
import {
	getInitialAssignmentValues,
	type SignatureAssignmentValues,
} from "@/frontend/features/signatures/SignatureWizard/types"
import { type DirectorySnapshot } from "@/frontend/queries/directory"
import { type Template, type TemplateAssignment } from "@/frontend/types/firebase"

import { ApplyMenu } from "./ApplyMenu"

interface SignatureAssignmentFormProps {
	template: Template
	templates: Template[]
	assignments: TemplateAssignment[]
	directory: DirectorySnapshot
	onSave: (values: SignatureAssignmentValues) => void | Promise<void>
	onApply: (values: SignatureAssignmentValues) => void | Promise<void>
	onCancel: () => void
	isSaving: boolean
	isApplying: boolean
}

export function SignatureAssignmentForm({
	template,
	templates,
	assignments,
	directory,
	onSave,
	onApply,
	onCancel,
	isSaving,
	isApplying,
}: SignatureAssignmentFormProps) {
	const form = useForm<SignatureAssignmentValues>({
		initialValues: getInitialAssignmentValues(template, assignments),
	})
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const claimedTargets = buildClaimedTargets(assignments, templates, template.id)
	const isBusy = isSaving || isApplying
	const recipients = useMemo(() => listWizardRecipientEmails(
		template.id,
		form.values,
		templates,
		assignments,
		directory.users,
	), [template.id, form.values, templates, assignments, directory.users])

	const scheduledInputProps = form.getInputProps("isScheduled", { type: "checkbox" })

	async function handleSave() {
		if(isBusy) return
		await onSave(form.values)
	}

	function handleSaveAndDeploy() {
		if(isBusy) return
		setIsConfirmOpen(true)
	}

	async function handleConfirmApply() {
		await onApply(form.values)
		setIsConfirmOpen(false)
	}

	function handleCancelApply() {
		if(isApplying) return
		setIsConfirmOpen(false)
	}

	return (
		<Stack gap="xl">
			<Stack gap={ 4 }>
				<Text fw={ 700 } size="lg">{ template.name }</Text>
				<Text size="sm" c="dimmed">
					Choose who receives this signature, then save the assignment or update those mailboxes.
				</Text>
			</Stack>

			<Stack gap="sm">
				<Stack gap={ 2 }>
					<Text fw={ 650 }>Who receives it</Text>
					<Text size="sm" c="dimmed">
						A person wins over a group, a group over an organizational unit, and any of those over the default. Each target can belong to only one signature.
					</Text>
				</Stack>
				<TargetsStep
					form={ form }
					directory={ directory }
					claimedTargets={ claimedTargets }
				/>
			</Stack>

			<Stack gap="sm">
				<Stack gap={ 2 }>
					<Text fw={ 650 }>Matched mailboxes</Text>
					<Text size="sm" c="dimmed">
						These accounts win this signature with the choices above.
					</Text>
				</Stack>
				<Paper p="md" className={ clsx(targetClasses.section, targetClasses.tinted) }>
					<DeployRecipientsList recipients={ recipients } />
				</Paper>
			</Stack>

			<Stack gap="sm">
				<Stack gap={ 2 }>
					<Text fw={ 650 }>Automation</Text>
					<Text size="sm" c="dimmed">
						This does not change who is matched. It decides whether those mailboxes are updated again each day.
					</Text>
				</Stack>
				<Paper p="md" className={ clsx(targetClasses.section) }>
					<Switch
						label="Apply every 24 hours"
						description="Reapply this signature to the matched accounts once a day."
						checked={ scheduledInputProps.checked }
						onChange={ scheduledInputProps.onChange }
					/>
				</Paper>
			</Stack>

			<Group justify="space-between">
				<Button type="button" variant="default" onClick={ onCancel } disabled={ isBusy }>
					Cancel
				</Button>
				<ApplyMenu
					isSaving={ isSaving }
					isApplying={ isApplying }
					onSave={ handleSave }
					onSaveAndDeploy={ handleSaveAndDeploy }
				/>
			</Group>
			<DeployConfirmModal
				opened={ isConfirmOpen }
				templateName={ template.name }
				recipients={ recipients }
				isDeploying={ isApplying }
				onConfirm={ handleConfirmApply }
				onCancel={ handleCancelApply }
			/>
		</Stack>
	)
}
