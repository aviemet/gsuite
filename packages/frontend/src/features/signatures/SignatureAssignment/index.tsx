import { Alert, Center, Loader } from "@mantine/core"

import { type SignatureAssignmentValues } from "@/frontend/features/signatures/SignatureWizard/types"
import { useDirectoryQuery } from "@/frontend/queries/directory"
import { useTemplateAssignmentsQuery, useTemplateQuery, useTemplatesQuery } from "@/frontend/queries/templates"

import { SignatureAssignmentForm } from "./SignatureAssignmentForm"

interface SignatureAssignmentProps {
	templateId: string
	onSave: (values: SignatureAssignmentValues) => void | Promise<void>
	onApply: (values: SignatureAssignmentValues) => void | Promise<void>
	onCancel: () => void
	isSaving?: boolean
	isApplying?: boolean
}

export function SignatureAssignment({
	templateId,
	onSave,
	onApply,
	onCancel,
	isSaving = false,
	isApplying = false,
}: SignatureAssignmentProps) {
	const { data: template, isLoading: isTemplateLoading } = useTemplateQuery(templateId)
	const { data: templates = [] } = useTemplatesQuery()
	const { data: assignments = [], isLoading: isAssignmentsLoading } = useTemplateAssignmentsQuery()
	const {
		data: directory,
		isLoading: isDirectoryLoading,
		error: directoryError,
	} = useDirectoryQuery()

	if(isTemplateLoading || isAssignmentsLoading || isDirectoryLoading) {
		return (
			<Center mih="12rem">
				<Loader />
			</Center>
		)
	}

	if(!template) {
		return (
			<Alert color="red" title="Signature not found">
				This signature is not available.
			</Alert>
		)
	}

	if(directoryError || !directory) {
		return (
			<Alert color="red" title="Directory unavailable">
				{ directoryError instanceof Error
					? directoryError.message
					: "Failed to load Workspace directory" }
			</Alert>
		)
	}

	return (
		<SignatureAssignmentForm
			template={ template }
			templates={ templates }
			assignments={ assignments }
			directory={ directory }
			onSave={ onSave }
			onApply={ onApply }
			onCancel={ onCancel }
			isSaving={ isSaving }
			isApplying={ isApplying }
		/>
	)
}
