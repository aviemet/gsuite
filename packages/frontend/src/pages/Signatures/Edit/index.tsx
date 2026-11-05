import { Alert, Center, Loader } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { Page } from "@/frontend/components/Page"
import { saveTemplate } from "@/frontend/features/signatures/saveTemplate"
import { SignatureDesign } from "@/frontend/features/signatures/SignatureDesign"
import { useTemplateQuery } from "@/frontend/queries/templates"

interface SignatureEditPageProps {
	templateId?: string
}

export function SignatureEditPage({ templateId }: SignatureEditPageProps) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { data: template, isLoading } = useTemplateQuery(templateId)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const title = templateId ? "Edit Signature" : "Create Signature"

	async function handleSubmit(values: { name: string, content: string }) {
		setIsSubmitting(true)
		try {
			await saveTemplate({
				templateId,
				name: values.name,
				content: values.content,
			})
			await queryClient.invalidateQueries({ queryKey: ["templates"] })
			notifications.show({
				color: "green",
				message: "Signature saved",
			})
			navigate({ to: "/admin/signatures" })
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
		navigate({ to: "/admin/signatures" })
	}

	if(templateId && isLoading) {
		return (
			<Page title={ title }>
				<Center h="100vh">
					<Loader />
				</Center>
			</Page>
		)
	}

	if(templateId && !template) {
		return (
			<Page title={ title }>
				<Alert color="red" title="Signature not found">
					This signature is not available.
				</Alert>
			</Page>
		)
	}

	return (
		<Page title={ title }>
			<SignatureDesign
				template={ template }
				onSubmit={ handleSubmit }
				onCancel={ handleCancel }
				isSubmitting={ isSubmitting }
			/>
		</Page>
	)
}
