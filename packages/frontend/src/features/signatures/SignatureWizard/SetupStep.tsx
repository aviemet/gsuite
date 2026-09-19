import { samplePerson } from "@/shared/person.testdata"
import { getTemplatePreviewContext } from "@/shared/templatePlaceholders"
import { Box, Button, Group, Paper, Radio, Select, SimpleGrid, Stack, Text } from "@mantine/core"
import { UseFormReturnType } from "@mantine/form"
import { IconFile, IconTemplate, IconUser } from "@tabler/icons-react"
import clsx from "clsx"
import { useState } from "react"

import { HtmlPreview } from "@/frontend/components/HtmlPreview"
import { formatHtmlWithDirectives } from "@/frontend/lib"
import { safeTemplateParse } from "@/frontend/lib/parseTemplate"
import { Template } from "@/frontend/types/firebase"

import {
	directoryUserSelectData,
	findDirectoryUser,
} from "./directoryTestdata"
import * as classes from "./SetupStep.css"
import {
	findStartTemplate,
	predefinedTemplates,
	toSavedStartTemplate,
} from "./startTemplates"
import { TemplatePickerModal } from "./TemplatePickerModal"
import { isSetupSource, type SignatureWizardValues } from "./types"

interface SetupStepProps {
	form: UseFormReturnType<SignatureWizardValues>
	templates: Template[]
}

const previewContext = getTemplatePreviewContext(samplePerson)

const setupOptions = [
	{
		value: "blank",
		label: "Blank canvas",
		description: "Start from scratch in the designer.",
		icon: IconFile,
	},
	{
		value: "template",
		label: "From template",
		description: "Start from a saved signature or a predefined layout.",
		icon: IconTemplate,
	},
	{
		value: "account",
		label: "Existing account",
		description: "Copy the signature currently on a user account.",
		icon: IconUser,
	},
] as const

export function SetupStep({ form, templates }: SetupStepProps) {
	const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false)
	const [draftTemplateId, setDraftTemplateId] = useState<string | null>(form.values.sourceTemplateId)
	const savedStartTemplates = templates.map(toSavedStartTemplate)
	const selectedTemplate = form.values.sourceTemplateId
		? findStartTemplate(form.values.sourceTemplateId, templates)
		: undefined
	const selectedAccount = form.values.sourceAccountEmail
		? findDirectoryUser(form.values.sourceAccountEmail)
		: undefined
	const previewSourceHtml = form.values.setupSource === "template"
		? selectedTemplate?.content
		: form.values.setupSource === "account"
			? selectedAccount?.signatureHtml
			: undefined
	const previewHtml = previewSourceHtml
		? safeTemplateParse(previewSourceHtml, previewContext)
		: null

	function getDefaultDraftTemplateId() {
		if(form.values.sourceTemplateId) {
			const committedTemplate = findStartTemplate(form.values.sourceTemplateId, templates)
			if(committedTemplate) return committedTemplate.id
		}

		if(savedStartTemplates.length > 0) return savedStartTemplates[0].id
		if(predefinedTemplates.length > 0) return predefinedTemplates[0].id
		return null
	}

	function handleOpenTemplatePicker() {
		setDraftTemplateId(getDefaultDraftTemplateId())
		setIsTemplatePickerOpen(true)
	}

	function handleCloseTemplatePicker() {
		setIsTemplatePickerOpen(false)
	}

	function handleSetupSourceChange(value: string) {
		if(!isSetupSource(value)) return

		form.setFieldValue("setupSource", value)
		form.clearFieldError("setupSource")

		if(value === "blank") {
			form.setFieldValue("content", "")
			form.setFieldValue("sourceTemplateId", null)
			form.setFieldValue("sourceAccountEmail", null)
			form.clearFieldError("sourceTemplateId")
			form.clearFieldError("sourceAccountEmail")
			setIsTemplatePickerOpen(false)
			return
		}

		if(value === "template") {
			form.setFieldValue("sourceAccountEmail", null)
			form.clearFieldError("sourceAccountEmail")
			handleOpenTemplatePicker()
			return
		}

		form.setFieldValue("sourceTemplateId", null)
		form.clearFieldError("sourceTemplateId")
		setIsTemplatePickerOpen(false)
	}

	function handleInsertTemplate() {
		if(!draftTemplateId) return

		const nextTemplate = findStartTemplate(draftTemplateId, templates)
		if(!nextTemplate) return

		form.setFieldValue("setupSource", "template")
		form.setFieldValue("sourceTemplateId", nextTemplate.id)
		form.setFieldValue("sourceAccountEmail", null)
		form.setFieldValue("content", formatHtmlWithDirectives(nextTemplate.content))
		form.clearFieldError("sourceTemplateId")
		form.clearFieldError("sourceAccountEmail")
		if(form.values.name.trim().length === 0) {
			form.setFieldValue("name", nextTemplate.name)
		}
		setIsTemplatePickerOpen(false)
	}

	function handleSourceAccountChange(email: string | null) {
		form.setFieldValue("sourceAccountEmail", email)
		form.clearFieldError("sourceAccountEmail")
		if(!email) return

		const account = findDirectoryUser(email)
		if(!account) return

		form.setFieldValue("content", formatHtmlWithDirectives(account.signatureHtml))
		if(form.values.name.trim().length === 0) {
			form.setFieldValue("name", `${account.displayName}'s signature`)
		}
	}

	function handleTemplateCardClick() {
		if(form.values.setupSource === "template") {
			handleOpenTemplatePicker()
		}
	}

	return (
		<Stack gap="lg" mt="md">
			<Radio.Group
				value={ form.values.setupSource ?? "" }
				onChange={ handleSetupSourceChange }
				label="How do you want to start?"
				error={ form.errors.setupSource }
			>
				<SimpleGrid cols={ { base: 1, sm: 3 } } mt="sm">
					{ setupOptions.map((option) => {
						const Icon = option.icon
						return (
							<Radio.Card
								key={ option.value }
								value={ option.value }
								className={ clsx(classes.sourceCard) }
								onClick={ option.value === "template" ? handleTemplateCardClick : undefined }
							>
								<Group wrap="nowrap" align="flex-start" gap="sm">
									<Radio.Indicator />
									<Stack gap="xs">
										<Icon size={ 22 } />
										<Text fw={ 600 }>{ option.label }</Text>
										<Text size="sm" c="dimmed">{ option.description }</Text>
									</Stack>
								</Group>
							</Radio.Card>
						)
					}) }
				</SimpleGrid>
			</Radio.Group>

			{ form.values.setupSource === "template" && (
				<Stack gap="sm">
					{ selectedTemplate
						? (
							<Group justify="space-between" align="center">
								<Text size="sm">
									Starting from <Text span fw={ 600 }>{ selectedTemplate.name }</Text>
								</Text>
								<Button type="button" variant="light" size="xs" onClick={ handleOpenTemplatePicker }>
									Change template
								</Button>
							</Group>
						)
						: (
							<Button type="button" variant="light" onClick={ handleOpenTemplatePicker }>
								Choose template
							</Button>
						) }
					{ typeof form.errors.sourceTemplateId === "string" && (
						<Text size="sm" c="red">{ form.errors.sourceTemplateId }</Text>
					) }
				</Stack>
			) }

			{ form.values.setupSource === "account" && (
				<Select
					label="Account"
					placeholder="Choose a user account"
					data={ directoryUserSelectData }
					searchable
					clearable
					nothingFoundMessage="No accounts"
					value={ form.values.sourceAccountEmail }
					onChange={ handleSourceAccountChange }
					error={ form.errors.sourceAccountEmail }
				/>
			) }

			{ previewHtml && (
				<Stack gap="xs">
					<Text fw={ 500 } size="sm">Starting preview</Text>
					<Paper p="md" withBorder bg="white" c="black">
						<Box className={ clsx(classes.sourcePreview) }>
							<HtmlPreview html={ previewHtml } />
						</Box>
					</Paper>
				</Stack>
			) }

			<TemplatePickerModal
				opened={ isTemplatePickerOpen }
				savedTemplates={ savedStartTemplates }
				predefinedTemplates={ predefinedTemplates }
				selectedId={ draftTemplateId }
				onSelectedIdChange={ setDraftTemplateId }
				onInsert={ handleInsertTemplate }
				onCancel={ handleCloseTemplatePicker }
			/>
		</Stack>
	)
}
