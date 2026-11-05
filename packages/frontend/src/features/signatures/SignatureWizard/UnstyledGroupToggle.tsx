import { Text } from "@mantine/core"
import { IconChevronDown } from "@tabler/icons-react"
import clsx from "clsx"

import * as classes from "./TemplatePickerModal.css"

interface UnstyledGroupToggleProps {
	label: string
	isExpanded: boolean
	onToggle: () => void
	Chevron: typeof IconChevronDown
}

export function UnstyledGroupToggle({ label, isExpanded, onToggle, Chevron }: UnstyledGroupToggleProps) {
	return (
		<button
			type="button"
			className={ clsx(classes.groupToggle) }
			onClick={ onToggle }
			aria-expanded={ isExpanded }
		>
			<Chevron size={ 14 } aria-hidden />
			<Text size="sm" fw={ 600 }>{ label }</Text>
		</button>
	)
}
