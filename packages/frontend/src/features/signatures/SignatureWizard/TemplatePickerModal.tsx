import { samplePerson } from "@/shared/person.testdata"
import { getTemplatePreviewContext } from "@/shared/templatePlaceholders"
import { Box, Button, Collapse, Group, Modal, Paper, Stack, Text, TextInput } from "@mantine/core"
import { IconChevronDown, IconChevronRight, IconFileText, IconSearch } from "@tabler/icons-react"
import clsx from "clsx"
import { ChangeEvent, useEffect, useRef, useState } from "react"

import { HtmlPreview } from "@/frontend/components/HtmlPreview"
import { safeTemplateParse } from "@/frontend/lib/parseTemplate"

import { type StartTemplate } from "./startTemplates"
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

const previewContext = getTemplatePreviewContext(samplePerson)

function filterTemplates(templates: StartTemplate[], searchQuery: string): StartTemplate[] {
	const normalizedQuery = searchQuery.trim().toLowerCase()
	if(normalizedQuery.length === 0) return templates

	return templates.filter((template) => template.name.toLowerCase().includes(normalizedQuery))
}

interface TemplateGroupProps {
	label: string
	templates: StartTemplate[]
	selectedId: string | null
	isExpanded: boolean
	onToggle: () => void
	onSelect: (templateId: string) => void
}

function TemplateGroup({
	label,
	templates,
	selectedId,
	isExpanded,
	onToggle,
	onSelect,
}: TemplateGroupProps) {
	const Chevron = isExpanded ? IconChevronDown : IconChevronRight

	function handleSelect(templateId: string) {
		onSelect(templateId)
	}

	return (
		<Stack gap={ 4 }>
			<UnstyledGroupToggle
				label={ `${label} (${templates.length})` }
				isExpanded={ isExpanded }
				onToggle={ onToggle }
				Chevron={ Chevron }
			/>
			<Collapse expanded={ isExpanded } keepMounted={ false }>
				<Stack gap={ 2 }>
					{ templates.map((template) => (
						<button
							key={ template.id }
							type="button"
							className={ clsx(classes.templateButton) }
							data-selected={ selectedId === template.id }
							onClick={ () => handleSelect(template.id) }
						>
							<IconFileText size={ 16 } />
							<Text size="sm" truncate>{ template.name }</Text>
						</button>
					)) }
				</Stack>
			</Collapse>
		</Stack>
	)
}

interface UnstyledGroupToggleProps {
	label: string
	isExpanded: boolean
	onToggle: () => void
	Chevron: typeof IconChevronDown
}

function UnstyledGroupToggle({ label, isExpanded, onToggle, Chevron }: UnstyledGroupToggleProps) {
	return (
		<button
			type="button"
			className={ clsx(classes.groupToggle) }
			onClick={ onToggle }
			aria-expanded={ isExpanded }
		>
			<Chevron size={ 14 } />
			<Text size="sm" fw={ 600 }>{ label }</Text>
		</button>
	)
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
							placeholder="Search"
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
