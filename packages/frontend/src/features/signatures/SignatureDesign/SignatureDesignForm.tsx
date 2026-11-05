import { Button, Group, Stack } from "@mantine/core"
import { useForm } from "@mantine/form"

import { SignatureTemplateForm } from "@/frontend/features/signatures/SignatureTemplateForm"
import { SetupStep } from "@/frontend/features/signatures/SignatureWizard/SetupStep"
import {
	getInitialDesignValues,
	type SignatureDesignValues,
} from "@/frontend/features/signatures/SignatureWizard/types"
import { formatHtmlWithDirectives } from "@/frontend/lib"
import { type DirectorySnapshot } from "@/frontend/queries/directory"
import { type Template } from "@/frontend/types/firebase"

interface SignatureDesignFormProps {
	template?: Template
	templates: Template[]
	directory: DirectorySnapshot | undefined
	onSubmit: (values: { name: string, content: string }) => void | Promise<void>
	onCancel: () => void
	isSubmitting?: boolean
}

export function SignatureDesignForm({
	template,
	templates,
	directory,
	onSubmit,
	onCancel,
	isSubmitting = false,
}: SignatureDesignFormProps) {
	const form = useForm<SignatureDesignValues>({
		initialValues: getInitialDesignValues(template),
	})

	function handleNameChange(name: string) {
		form.setFieldValue("name", name)
	}

	function handleContentChange(content: string) {
		form.setFieldValue("content", content)
	}

	async function handleSave() {
		if(isSubmitting) return
		const { values } = form
		if(!template) {
			if(!values.setupSource) {
				form.setFieldError("setupSource", "Choose how to start")
				return
			}
			if(values.setupSource === "template" && !values.sourceTemplateId) {
				form.setFieldError("sourceTemplateId", "Choose a template")
				return
			}
			if(values.setupSource === "account" && !values.sourceAccountEmail) {
				form.setFieldError("sourceAccountEmail", "Choose an account")
				return
			}
		}

		const nameError = values.name.trim().length === 0 ? "Name is required" : null
		const contentError = values.content.trim().length === 0 ? "Content is required" : null
		form.setFieldError("name", nameError)
		form.setFieldError("content", contentError)
		if(nameError || contentError) return

		const content = formatHtmlWithDirectives(values.content)
		await onSubmit({ name: values.name.trim(), content })
	}

	const nameError = typeof form.errors.name === "string" ? form.errors.name : undefined
	const contentError = typeof form.errors.content === "string" ? form.errors.content : undefined

	return (
		<Stack gap="xl">
			{ !template && directory && (
				<SetupStep form={ form } templates={ templates } directory={ directory } />
			) }
			<SignatureTemplateForm
				name={ form.values.name }
				nameError={ nameError }
				onNameChange={ handleNameChange }
				content={ form.values.content }
				contentError={ contentError }
				onContentChange={ handleContentChange }
			/>
			<Group justify="space-between">
				<Button type="button" variant="default" onClick={ onCancel } disabled={ isSubmitting }>
					Cancel
				</Button>
				<Button type="button" onClick={ handleSave } loading={ isSubmitting }>
					Save
				</Button>
			</Group>
		</Stack>
	)
}
