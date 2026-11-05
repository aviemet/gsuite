import { IconCheck, IconChevronDown } from "@tabler/icons-react"

import * as classes from "./OrganizationalUnitSelect.css"

interface OrganizationalUnitSelectOptionProps {
	name: string
	depth: number
	hasChildren: boolean
	isChecked: boolean
}

export function OrganizationalUnitSelectOption({
	name,
	depth,
	hasChildren,
	isChecked,
}: OrganizationalUnitSelectOptionProps) {
	return (
		<span
			className={ classes.option }
			data-depth={ depth }
			data-checked={ isChecked }
			style={ { paddingInlineStart: `${ depth }rem` } }
		>
			<span className={ classes.marker }>
				{ hasChildren ? <IconChevronDown size={ 14 } aria-hidden /> : null }
			</span>
			<span className={ classes.name }>{ name }</span>
			{ isChecked ? <IconCheck size={ 16 } className={ classes.check } aria-hidden /> : null }
		</span>
	)
}
