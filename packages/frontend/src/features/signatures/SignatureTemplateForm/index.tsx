import {
	Box,
	Grid,
	Group,
	SegmentedControl,
	Text,
	TextInput,
	VisuallyHidden,
} from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { IconLayoutColumns, IconLayoutRows } from "@tabler/icons-react"
import clsx from "clsx"
import { ChangeEvent, useRef, useState } from "react"

import { HtmlEditor, type HtmlEditorHandle } from "@/frontend/components/HtmlEditor"
import { HtmlPreview } from "@/frontend/components/HtmlPreview"
import { RichTextEditor, type RichTextEditorHandle } from "@/frontend/components/RichTextEditor"
import * as richTextClasses from "@/frontend/components/RichTextEditor/RichTextEditor.css"
import { PlaceholderPicker } from "@/frontend/features/signatures/PlaceholderPicker"
import { safeTemplateParse } from "@/shared/parseTemplate"
import { samplePerson } from "@/shared/person.testdata"
import { getTemplatePreviewContext } from "@/shared/templatePlaceholders"

import { ComposeEditorShell } from "./ComposeEditorShell"
import { EmailPreviewFrame } from "./EmailPreviewFrame"
import * as classes from "./SignatureTemplateForm.css"

type EditorPreviewLayout = "side-by-side" | "stacked"

const editorPreviewLayoutControlStyles = {
	root: {
		border: "1px solid var(--mantine-color-default-border)",
		background: "light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))",
	},
	label: {
		lineHeight: 1,
	},
}

interface SignatureTemplateFormProps {
	name: string
	nameError?: string
	onNameChange: (name: string) => void
	content: string
	contentError?: string
	onContentChange: (content: string) => void
}

export function SignatureTemplateForm({
	name,
	nameError,
	onNameChange,
	content,
	contentError,
	onContentChange,
}: SignatureTemplateFormProps) {
	const [editorMode, setEditorMode] = useState<"visual" | "code">("visual")
	const [editorPreviewLayout, setEditorPreviewLayout] = useLocalStorage<EditorPreviewLayout>({
		key: "signature-editor-preview-layout",
		defaultValue: "side-by-side",
	})
	const htmlEditorRef = useRef<HtmlEditorHandle>(null)
	const richTextEditorRef = useRef<RichTextEditorHandle>(null)
	const editorPreviewColumnSpan = editorPreviewLayout === "stacked"
		? 12
		: { sm: 12, md: 6 }

	function handleEditorPreviewLayoutChange(value: string) {
		if(value === "side-by-side" || value === "stacked") {
			setEditorPreviewLayout(value)
		}
	}

	function handleEditorModeChange(newMode: string) {
		if(newMode === "visual" || newMode === "code") {
			setEditorMode(newMode)
		}
	}

	function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
		onNameChange(event.currentTarget.value)
	}

	function insertPlaceholder(value: string) {
		if(editorMode === "code") {
			htmlEditorRef.current?.insertAtCursor(value)
			return
		}

		richTextEditorRef.current?.insertAtCursor(value)
	}

	const previewHtml = safeTemplateParse(content, getTemplatePreviewContext(samplePerson))

	return (
		<Grid mt="md">
			<Grid.Col>
				<TextInput
					label="Template Name"
					placeholder="Enter template name"
					required
					value={ name }
					onChange={ handleNameChange }
					error={ nameError }
				/>
			</Grid.Col>

			<Grid.Col visibleFrom="md">
				<Group justify="flex-end">
					<SegmentedControl
						size="xs"
						aria-label="Editor and preview layout"
						value={ editorPreviewLayout }
						onChange={ handleEditorPreviewLayoutChange }
						data={ [
							{
								value: "side-by-side",
								label: (
									<>
										<IconLayoutColumns size="1rem" aria-hidden />
										<VisuallyHidden>Side by side</VisuallyHidden>
									</>
								),
							},
							{
								value: "stacked",
								label: (
									<>
										<IconLayoutRows size="1rem" aria-hidden />
										<VisuallyHidden>Stacked</VisuallyHidden>
									</>
								),
							},
						] }
						styles={ editorPreviewLayoutControlStyles }
					/>
				</Group>
			</Grid.Col>

			<Grid.Col span={ editorPreviewColumnSpan }>
				<Box className={ clsx(classes.paneCard) }>
					<Group justify="space-between" align="center" wrap="nowrap" className={ clsx(classes.paneHeader) }>
						<Text className={ classes.paneTitle } size="sm">Editor</Text>
						<SegmentedControl
							size="xs"
							value={ editorMode }
							onChange={ handleEditorModeChange }
							data={ [
								{ value: "visual", label: "Visual" },
								{ value: "code", label: "Code" },
							] }
						/>
					</Group>
					{ editorMode === "code"
						? (
							<HtmlEditor
								ref={ htmlEditorRef }
								value={ content }
								onChange={ onContentChange }
							/>
						)
						: (
							<ComposeEditorShell
								to={ samplePerson.primaryEmail }
								subject="Signature template preview"
							>
								<RichTextEditor
									ref={ richTextEditorRef }
									className={ richTextClasses.embedded }
									value={ content }
									onChange={ onContentChange }
								/>
							</ComposeEditorShell>
						) }
					{ contentError && (
						<Text c="red" size="sm">{ contentError }</Text>
					) }
				</Box>
			</Grid.Col>

			<Grid.Col span={ editorPreviewColumnSpan }>
				<Box className={ clsx(classes.paneCard) }>
					<Group justify="space-between" align="center" wrap="nowrap" className={ clsx(classes.paneHeader) }>
						<Text className={ classes.paneTitle } size="sm">Preview</Text>
					</Group>
					<EmailPreviewFrame
						senderName={ samplePerson.organization }
						senderEmail={ samplePerson.primaryEmail }
					>
						<HtmlPreview html={ previewHtml } />
					</EmailPreviewFrame>
				</Box>
			</Grid.Col>

			<Grid.Col>
				<PlaceholderPicker onInsert={ insertPlaceholder } />
			</Grid.Col>
		</Grid>
	)
}
