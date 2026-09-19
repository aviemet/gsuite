import { Loader, Center } from "@mantine/core"
import { useNavigate, useRouter } from "@tanstack/react-router"

import { Page } from "@/frontend/components/Page"
import { SignatureWizard } from "@/frontend/features/signatures/SignatureWizard"
import { useTemplateQuery } from "@/frontend/queries/templates"

export function SignatureEditPage() {
	const navigate = useNavigate()
	const router = useRouter()
	const id = router.state.location.pathname.split("/").pop()
	const isEdit = id && id !== "edit"
	const { data: template, isLoading } = useTemplateQuery(isEdit ? id : undefined)
	const title = isEdit ? "Edit Signature Template" : "Create Signature Template"

	const handleSubmit = () => {
		navigate({ to: "/signatures" })
	}

	const handleCancel = () => {
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
			/>
		</Page>
	)
}
