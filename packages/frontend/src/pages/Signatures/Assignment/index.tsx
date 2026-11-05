import { notifications } from "@mantine/notifications"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { Page } from "@/frontend/components/Page"
import { deploySignatureTemplate } from "@/frontend/features/signatures/deploySignatureTemplate"
import {
	notifyDeployError,
	notifyDeploySuccess,
} from "@/frontend/features/signatures/notifyDeployResult"
import { saveAssignment } from "@/frontend/features/signatures/saveAssignment"
import { SignatureAssignment } from "@/frontend/features/signatures/SignatureAssignment"
import { type SignatureAssignmentValues } from "@/frontend/features/signatures/SignatureWizard/types"

interface SignatureAssignmentPageProps {
	templateId: string
}

export function SignatureAssignmentPage({ templateId }: SignatureAssignmentPageProps) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [isSaving, setIsSaving] = useState(false)
	const [isApplying, setIsApplying] = useState(false)

	async function persistAssignment(values: SignatureAssignmentValues) {
		await saveAssignment({
			templateId,
			isDefault: values.isDefault,
			userEmails: values.userEmails,
			groupIds: values.groupIds,
			organizationalUnitPaths: values.organizationalUnitPaths,
			isScheduled: values.isScheduled,
		})
		await queryClient.invalidateQueries({ queryKey: ["templates"] })
		await queryClient.invalidateQueries({ queryKey: ["templateAssignments"] })
	}

	async function handleSave(values: SignatureAssignmentValues) {
		setIsSaving(true)
		try {
			await persistAssignment(values)
			notifications.show({
				color: "green",
				message: "Assignment saved",
			})
			navigate({ to: "/admin/signatures" })
		} catch (error) {
			notifications.show({
				color: "red",
				message: error instanceof Error ? error.message : "Failed to save assignment",
			})
		} finally {
			setIsSaving(false)
		}
	}

	async function handleApply(values: SignatureAssignmentValues) {
		setIsApplying(true)
		try {
			await persistAssignment(values)
			const result = await deploySignatureTemplate(templateId)
			notifyDeploySuccess(result.queuedUserCount)
			navigate({ to: "/admin/signatures" })
		} catch (error) {
			notifyDeployError(error)
		} finally {
			setIsApplying(false)
		}
	}

	function handleCancel() {
		navigate({ to: "/admin/signatures" })
	}

	return (
		<Page title="Signature assignment">
			<SignatureAssignment
				templateId={ templateId }
				onSave={ handleSave }
				onApply={ handleApply }
				onCancel={ handleCancel }
				isSaving={ isSaving }
				isApplying={ isApplying }
			/>
		</Page>
	)
}
