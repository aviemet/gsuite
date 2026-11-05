import { type RenderTreeNodePayload } from "@mantine/core"
import { IconCheck, IconChevronDown } from "@tabler/icons-react"
import clsx from "clsx"
import { type MouseEvent } from "react"

import * as classes from "./OrganizationalUnitTree.css"

interface OrganizationalUnitNodeProps extends RenderTreeNodePayload {
	disabledReason?: string
}

export function OrganizationalUnitNode({
	node,
	expanded,
	hasChildren,
	elementProps,
	tree,
	disabledReason,
}: OrganizationalUnitNodeProps) {
	const checked = tree.isNodeChecked(node.value) === true
	const isDisabled = Boolean(disabledReason) && !checked
	const nodeLabel = typeof node.label === "string" ? node.label : node.value

	function handleToggleChecked(event: MouseEvent) {
		event.stopPropagation()
		if(isDisabled) return
		if(checked) tree.uncheckNode(node.value)
		else tree.checkNode(node.value)
	}

	function handleToggleExpanded(event: MouseEvent) {
		event.preventDefault()
		event.stopPropagation()
		tree.toggleExpanded(node.value)
	}

	return (
		<div
			{ ...elementProps }
			className={ clsx(elementProps.className, classes.node) }
			data-checked={ checked }
			data-disabled={ isDisabled }
			aria-disabled={ isDisabled }
			onClick={ handleToggleChecked }
		>
			{ hasChildren
				? (
					<button
						type="button"
						className={ clsx(classes.chevron) }
						data-expanded={ expanded }
						aria-label={ expanded ? `Collapse ${nodeLabel}` : `Expand ${nodeLabel}` }
						onMouseDown={ (event) => event.stopPropagation() }
						onClick={ handleToggleExpanded }
					>
						<IconChevronDown className={ clsx(classes.chevronIcon) } />
					</button>
				)
				: <span className={ clsx(classes.chevronSpacer) } /> }
			<span className={ clsx(classes.label) }>{ node.label }</span>
			{ isDisabled && disabledReason && (
				<span className={ clsx(classes.disabledReason) }>{ disabledReason }</span>
			) }
			{ checked && (
				<IconCheck
					size={ 16 }
					className={ clsx(classes.checkIcon) }
					aria-label={ `${ node.label } selected` }
				/>
			) }
		</div>
	)
}
