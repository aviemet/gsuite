import { Container, Title } from "@mantine/core"
import { useNavigate, useRouter } from "@tanstack/react-router"

import { SignatureTemplateForm } from "@/frontend/components/SignatureTemplateForm"
import { useTemplates } from "@/frontend/hooks/useTemplates"

const SignatureEditPage = () => {
	const navigate = useNavigate()
	const router = useRouter()
	const { templates, loading } = useTemplates()

	const id = router.state.location.pathname.split("/").pop()
	const template = id && id !== "edit" ? templates.find((t) => t.id === id) : undefined

	const handleSubmit = async(values: { name: string, content: string }) => {
		// TODO: Implement template saving
		console.log("Saving template:", values)
		navigate({ to: "/signatures" })
	}

	const handleCancel = () => {
		navigate({ to: "/signatures" })
	}

	return (
		<Container>
			<Title mb="xl">{ template ? "Edit Signature Template" : "Create Signature Template" }</Title>
			<SignatureTemplateForm
				template={ template }
				onSubmit={ handleSubmit }
				onCancel={ handleCancel }
			/>
		</Container>
	)
}

export { SignatureEditPage }
