import { Center, Loader } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useState } from "react"

import { Page } from "@/frontend/components/Page"
import { saveAndDeploySignature } from "@/frontend/features/signatures/saveAndDeploySignature"
import { SignatureWizard } from "@/frontend/features/signatures/SignatureWizard"
import { type SignatureWizardValues } from "@/frontend/features/signatures/SignatureWizard/types"
import { useTemplateQuery } from "@/frontend/queries/templates"

export function SignatureEditPage() {
	const navigate = useNavigate()
	const router = useRouter()
	const queryClient = useQueryClient()
	const id = router.state.location.pathname.split("/").pop()
	const isEdit = id && id !== "edit"
	const { data: template, isLoading } = useTemplateQuery(isEdit ? id : undefined)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const title = isEdit ? "Edit Signature Template" : "Create Signature Template"

	async function handleSubmit(values: SignatureWizardValues) {
		setIsSubmitting(true)
		try {
			await saveAndDeploySignature(values, isEdit ? id : undefined)
			await queryClient.invalidateQueries({ queryKey: ["templates"] })
			notifications.show({
				color: "green",
				message: "Signature saved and queued for deploy",
			})
			navigate({ to: "/signatures" })
		} catch (error) {
			notifications.show({
				color: "red",
				message: error instanceof Error ? error.message : "Failed to save signature",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	function handleCancel() {
		navigate({ to: "/signatures" })
	}

	if(isEdit && isLoading) {
		return (
			<Page title={ title }>
				<Center h="100vh">
					<Loader />
				</Center>
			</Page>
		)
	}

	return (
		<Page title={ title }>
			<SignatureWizard
				template={ template }
				onSubmit={ handleSubmit }
				onCancel={ handleCancel }
				isSubmitting={ isSubmitting }
			/>
		</Page>
	)
}
