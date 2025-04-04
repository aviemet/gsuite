import { Button, Group, Stack, Text, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { RichTextEditor, Link } from "@mantine/tiptap"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

import { Template } from "@/frontend/types/firebase"

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
			content: template?.content ?? "",
		},
		validate: {
			name: (value) => (!value ? "Name is required" : null),
			content: (value) => (!value ? "Content is required" : null),
		},
	})

	const editor = useEditor({
		extensions: [StarterKit, Link],
		content: form.values.content,
		onUpdate: ({ editor }) => {
			form.setFieldValue("content", editor.getHTML())
		},
	})

	return (
		<form onSubmit={ form.onSubmit(onSubmit) }>
			<Stack>
				<TextInput
					label="Template Name"
					placeholder="Enter template name"
					required
					{ ...form.getInputProps("name") }
				/>

				<Stack gap="xs">
					<Text fw={ 500 } size="sm">Signature Content</Text>
					<RichTextEditor
						editor={ editor }
					>
						<RichTextEditor.Toolbar sticky stickyOffset={ 60 }>
							<RichTextEditor.ControlsGroup>
								<RichTextEditor.Bold />
								<RichTextEditor.Italic />
								<RichTextEditor.Underline />
								<RichTextEditor.Strikethrough />
								<RichTextEditor.ClearFormatting />
								<RichTextEditor.Highlight />
								<RichTextEditor.Code />
							</RichTextEditor.ControlsGroup>

							<RichTextEditor.ControlsGroup>
								<RichTextEditor.H1 />
								<RichTextEditor.H2 />
								<RichTextEditor.H3 />
								<RichTextEditor.H4 />
							</RichTextEditor.ControlsGroup>

							<RichTextEditor.ControlsGroup>
								<RichTextEditor.BulletList />
								<RichTextEditor.OrderedList />
								<RichTextEditor.Hr />
								<RichTextEditor.Blockquote />
								<RichTextEditor.Undo />
								<RichTextEditor.Redo />
							</RichTextEditor.ControlsGroup>

							<RichTextEditor.ControlsGroup>
								<RichTextEditor.Link />
								<RichTextEditor.Unlink />
							</RichTextEditor.ControlsGroup>
						</RichTextEditor.Toolbar>

						<RichTextEditor.Content />
					</RichTextEditor>
				</Stack>

				<Group justify="flex-end">
					<Button variant="light" onClick={ onCancel }>
						Cancel
					</Button>
					<Button type="submit">Save Template</Button>
				</Group>
			</Stack>
		</form>
	)
}
