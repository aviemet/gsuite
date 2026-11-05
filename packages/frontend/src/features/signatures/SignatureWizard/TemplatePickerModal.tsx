import { Box, Button, Group, Modal, Paper, Stack, Text, TextInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import clsx from "clsx"
import { type ChangeEvent, useEffect, useRef, useState } from "react"

import { HtmlPreview } from "@/frontend/components/HtmlPreview"
import { safeTemplateParse } from "@/shared/parseTemplate"
import { buildPreviewTemplateContext } from "@/shared/templatePlaceholders"

import { type StartTemplate } from "./startTemplates"
import { TemplateGroup } from "./TemplateGroup"
import * as classes from "./TemplatePickerModal.css"

interface TemplatePickerModalProps {
	opened: boolean
	savedTemplates: StartTemplate[]
	predefinedTemplates: StartTemplate[]
	selectedId: string | null
	onSelectedIdChange: (templateId: string) => void
	onInsert: () => void
	onCancel: () => void
}

const previewContext = buildPreviewTemplateContext()

function filterTemplates(templates: StartTemplate[], searchQuery: string): StartTemplate[] {
	const normalizedQuery = searchQuery.trim().toLowerCase()
	if(normalizedQuery.length === 0) return templates

	return templates.filter((template) => template.name.toLowerCase().includes(normalizedQuery))
}

export function TemplatePickerModal({
	opened,
	savedTemplates,
	predefinedTemplates,
	selectedId,
	onSelectedIdChange,
	onInsert,
	onCancel,
}: TemplatePickerModalProps) {
	const [searchQuery, setSearchQuery] = useState("")
	const [isSavedExpanded, setIsSavedExpanded] = useState(true)
	const [isPredefinedExpanded, setIsPredefinedExpanded] = useState(true)
	const wasOpenedRef = useRef(opened)
	const filteredSavedTemplates = filterTemplates(savedTemplates, searchQuery)
	const filteredPredefinedTemplates = filterTemplates(predefinedTemplates, searchQuery)
	const hasSearchQuery = searchQuery.trim().length > 0
	const showSavedGroup = isSavedExpanded || hasSearchQuery
	const showPredefinedGroup = isPredefinedExpanded || hasSearchQuery
	const allTemplates = [...savedTemplates, ...predefinedTemplates]
	const selectedTemplate = selectedId
		? allTemplates.find((template) => template.id === selectedId)
		: undefined
	const previewHtml = selectedTemplate
		? safeTemplateParse(selectedTemplate.content, previewContext)
		: null
	const hasNoMatches = filteredSavedTemplates.length === 0 && filteredPredefinedTemplates.length === 0

	useEffect(() => {
		const shouldReset = opened && !wasOpenedRef.current
		wasOpenedRef.current = opened
		if(!shouldReset) return

		setSearchQuery("")
		setIsSavedExpanded(true)
		setIsPredefinedExpanded(true)
	}, [opened])

	function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
		setSearchQuery(event.currentTarget.value)
	}

	function handleToggleSaved() {
		setIsSavedExpanded((isExpanded) => !isExpanded)
	}

	function handleTogglePredefined() {
		setIsPredefinedExpanded((isExpanded) => !isExpanded)
	}

	return (
		<Modal
			opened={ opened }
			onClose={ onCancel }
			title="Templates"
			size="xl"
		>
			<Stack gap="md">
				<Box className={ clsx(classes.shell) }>
					<Box className={ clsx(classes.sidebar) }>
						<TextInput
							aria-label="Search templates"
							placeholder="Search templates"
							leftSection={ <IconSearch size={ 16 } /> }
							value={ searchQuery }
							onChange={ handleSearchChange }
						/>
						<Box className={ clsx(classes.templateList) }>
							{ hasNoMatches
								? (
									<Text size="sm" c="dimmed">No templates found</Text>
								)
								: (
									<Stack gap="md">
										{ filteredSavedTemplates.length > 0 && (
											<TemplateGroup
												label="Saved Templates"
												templates={ filteredSavedTemplates }
												selectedId={ selectedId }
												isExpanded={ showSavedGroup }
												onToggle={ handleToggleSaved }
												onSelect={ onSelectedIdChange }
											/>
										) }
										{ filteredPredefinedTemplates.length > 0 && (
											<TemplateGroup
												label="Predefined Templates"
												templates={ filteredPredefinedTemplates }
												selectedId={ selectedId }
												isExpanded={ showPredefinedGroup }
												onToggle={ handleTogglePredefined }
												onSelect={ onSelectedIdChange }
											/>
										) }
									</Stack>
								) }
						</Box>
					</Box>
					<Box className={ clsx(classes.previewPane) }>
						<Text fw={ 600 }>{ selectedTemplate?.name ?? "Select a template" }</Text>
						<Paper p="md" withBorder bg="white" c="black" className={ clsx(classes.previewCanvas) }>
							{ previewHtml
								? <HtmlPreview html={ previewHtml } />
								: <Text size="sm" c="dimmed">Choose a template to preview it.</Text> }
						</Paper>
					</Box>
				</Box>
				<Group justify="flex-end">
					<Button type="button" variant="default" onClick={ onCancel }>
						Cancel
					</Button>
					<Button type="button" onClick={ onInsert } disabled={ !selectedTemplate }>
						Use Template
					</Button>
				</Group>
			</Stack>
		</Modal>
	)
}
