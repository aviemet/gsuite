import { escape } from "@f0c1s/escape-html"
import { Button, Group, Stack, Text, TextInput, Grid, Paper, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useState, useEffect } from "react"
import { HtmlHighlight } from "@/frontend/components/HtmlHighlight"
import { RichTextEditor } from "@/frontend/components/RichTextEditor"

import { formatHtmlWithDirectives } from "@/frontend/lib"
import { Template } from "@/frontend/types/firebase"
import { samplePerson } from "../../../../../shared/src/person.testdata"

interface SignatureTemplateFormProps {
	template?: Template
	onSubmit: (values: { name: string, content: string }) => void
	onCancel: () => void
}

type Context = Record<string, any>;

function safeTemplateParse(template: string, context: Record<string, any>): string {
	// Replace all {{#if var}} ... {{/if}} blocks (tolerant of whitespace and newlines)
	template = template.replace(/\{\{#if\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
		return context[key] ? content : ""
	})
	// Remove any unmatched {{#if ...}} or {{/if}}
	template = template.replace(/\{\{#if\s+\w+\s*\}\}/g, "")
	template = template.replace(/\{\{\/if\}\}/g, "")
	// Replace all {{{var}}} with values or blank (tolerant of whitespace)
	template = template.replace(/\{\{\{\s*(\w+)\s*\}\}\}/g, (_, key) => {
		return context[key] ?? ""
	})
	// Replace all {{var}} with values or blank (tolerant of whitespace)
	template = template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
		return context[key] ?? ""
	})
	return template
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

	const [showHtml, setShowHtml] = useState(false)
	const [formattedHtml, setFormattedHtml] = useState("")

	useEffect(() => {
		setFormattedHtml(formatHtmlWithDirectives(form.values.content))
	}, [template, form.values.content])

	function handleSubmit(values: { name: string, content: string }) {
		setFormattedHtml(formatHtmlWithDirectives(values.content))
		onSubmit(values)
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
					<Stack gap="xs">
						<Group justify="space-between">
							<Text fw={ 500 } size="sm">Signature Content</Text>
							<Button size="xs" variant="default" onClick={ () => setShowHtml((v) => !v) } type="button">
								{ showHtml ? "Show Editor" : "Show HTML" }
							</Button>
						</Group>
						{ showHtml
							? (
								<HtmlHighlight code={ formattedHtml } radius="md" withCopyButton={ false } />
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
					<Paper p="md" withBorder>
						<div dangerouslySetInnerHTML={ { __html: previewHtml } } />
					</Paper>
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
