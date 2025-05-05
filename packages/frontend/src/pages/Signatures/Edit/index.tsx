import { Container, Title, Loader, Center } from "@mantine/core"
import { useNavigate, useRouter } from "@tanstack/react-router"

import { SignatureTemplateForm } from "@/frontend/features/signatures/SignatureTemplateForm"
import { useTemplateQuery } from "@/frontend/queries/templates"

const SignatureEditPage = () => {
	const navigate = useNavigate()
	const router = useRouter()
	const id = router.state.location.pathname.split("/").pop()
	const isEdit = id && id !== "edit"
	const { data: template, isLoading } = useTemplateQuery(isEdit ? id : undefined)

	const handleSubmit = async(values: { name: string, content: string }) => {
		console.log("Saving template:", values)
		navigate({ to: "/signatures" })
	}

	const handleCancel = () => {
		navigate({ to: "/signatures" })
	}

	if(isEdit && isLoading) {
		return (
			<Center h="100vh">
				<Loader />
			</Center>
		)
	}

	return (
		<Container>
			<Title mb="xl">{ isEdit ? "Edit Signature Template" : "Create Signature Template" }</Title>
			<SignatureTemplateForm
				template={ template }
				onSubmit={ handleSubmit }
				onCancel={ handleCancel }
			/>
		</Container>
	)
}

export { SignatureEditPage }
