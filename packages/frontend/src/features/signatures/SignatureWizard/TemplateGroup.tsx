import { Collapse, Stack, Text } from "@mantine/core"
import { IconChevronDown, IconChevronRight, IconFileText } from "@tabler/icons-react"
import clsx from "clsx"

import { type StartTemplate } from "./startTemplates"
import * as classes from "./TemplatePickerModal.css"
import { UnstyledGroupToggle } from "./UnstyledGroupToggle"

interface TemplateGroupProps {
	label: string
	templates: StartTemplate[]
	selectedId: string | null
	isExpanded: boolean
	onToggle: () => void
	onSelect: (templateId: string) => void
}

export function TemplateGroup({
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
							aria-pressed={ selectedId === template.id }
							onClick={ () => handleSelect(template.id) }
						>
							<IconFileText size={ 16 } aria-hidden />
							<Text size="sm" truncate>{ template.name }</Text>
						</button>
					)) }
				</Stack>
			</Collapse>
		</Stack>
	)
}
