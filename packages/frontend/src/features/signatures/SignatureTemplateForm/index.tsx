import { escape } from "@f0c1s/escape-html"
import {
	Button,
	Group,
	Stack,
	Text,
	TextInput,
	Grid,
	Paper,
	SegmentedControl,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { useLocalStorage } from "@mantine/hooks"
import { HtmlEditor } from "@/frontend/components/HtmlEditor"
import { HtmlPreview } from "@/frontend/components/HtmlPreview"
import { RichTextEditor } from "@/frontend/components/RichTextEditor"

import { formatHtmlWithDirectives } from "@/frontend/lib"
import { safeTemplateParse } from "@/frontend/lib/parseTemplate"
import { Template } from "@/frontend/types/firebase"
import { samplePerson } from "@/shared/person.testdata"

interface SignatureTemplateFormProps {
	template?: Template
	onSubmit: (values: { name: string, content: string }) => void
	onCancel: () => void
}

export const SignatureTemplateForm = ({
	template,
	onSubmit,
	onCancel,
}: SignatureTemplateFormProps) => {
	const form = useForm({
		initialValues: {
			name: template?.name ?? "",
			content: formatHtmlWithDirectives(template?.content ?? ""),
		},
		validate: {
			name: (value) => (!value ? "Name is required" : null),
			content: (value) => (!value ? "Content is required" : null),
		},
	})

	const [editorMode, setEditorMode] = useLocalStorage<"visual" | "code">({
		key: "signature-template-editor-mode",
		defaultValue: "visual",
	})

	function handleSubmit(values: { name: string, content: string }) {
		const prettyContent = formatHtmlWithDirectives(values.content)
		// Update form state as well, in case of submission failure and user stays on form
		if(form.values.content !== prettyContent) {
			form.setFieldValue("content", prettyContent)
		}
		onSubmit({ ...values, content: prettyContent })
	}

	const previewContext = {
		...samplePerson,
		name: samplePerson.displayName,
		email: samplePerson.primaryEmail,
		phone: samplePerson.phoneNumbers?.[0]?.number ?? "",
	}
	const previewHtml = safeTemplateParse(form.values.content, previewContext)

	return (
		<form onSubmit={ form.onSubmit(handleSubmit) }>
			<Grid gutter="xl">
				<Grid.Col>
					<TextInput
						label="Template Name"
						placeholder="Enter template name"
						required
						{ ...form.getInputProps("name") }
					/>
				</Grid.Col>

				<Grid.Col span={ { sm: 12, md: 6 } }>
					<Stack>
						<Group justify="space-between">
							<Text fw={ 500 } size="sm">Signature Content</Text>
							<SegmentedControl
								size="xs"
								value={ editorMode }
								onChange={ (newMode) => {
									const currentContent = form.values.content
									const prettyContent = formatHtmlWithDirectives(currentContent)
									if(currentContent !== prettyContent) {
										form.setFieldValue("content", prettyContent)
									}
									setEditorMode(newMode as "visual" | "code")
								} }
								data={ [
									{ value: "visual", label: "Visual Editor" },
									{ value: "code", label: "Code Editor" },
								] }
							/>
						</Group>
						{ editorMode === "code"
							? (
								<HtmlEditor
									value={ form.values.content }
									onChange={ (newContent) => form.setFieldValue("content", newContent) }
								/>
							)
							: (
								<RichTextEditor
									value={ form.values.content }
									onChange={ (val) => form.setFieldValue("content", val) }
								/>
							) }

					</Stack>
				</Grid.Col>

				<Grid.Col span={ { sm: 12, md: 6 } }>
					<Stack>
						<Text fw={ 500 } size="sm">Live Preview</Text>
						<Paper p="md" withBorder>
							<HtmlPreview html={ previewHtml } />
						</Paper>
					</Stack>
				</Grid.Col>

				<Grid.Col>
					<Group justify="flex-end">
						<Button variant="light" onClick={ onCancel }>
							Cancel
						</Button>
						<Button type="submit">Save Template</Button>
					</Group>
				</Grid.Col>
			</Grid>
		</form>
	)
}
