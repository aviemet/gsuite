import {
	filterTreeData,
	getTreeExpandedState,
	Input,
	type RenderTreeNodePayload,
	Text,
	TextInput,
	Tree,
	type TreeNodeData,
	useTree,
} from "@mantine/core"
import { IconChevronDown, IconSearch } from "@tabler/icons-react"
import clsx from "clsx"
import { type ChangeEvent, type MouseEvent, type ReactNode, useMemo, useState } from "react"

import * as classes from "./OrganizationalUnitTree.css"

function arePathListsEqual(left: string[], right: string[]) {
	if(left.length !== right.length) return false
	const rightSet = new Set(right)
	return left.every((path) => rightSet.has(path))
}

export interface OrganizationalUnitTreeProps {
	data: TreeNodeData[]
	value: string[]
	onChange: (value: string[]) => void
	label?: ReactNode
	error?: ReactNode
	searchPlaceholder?: string
	nothingFoundMessage?: string
}

function OrganizationalUnitNode({
	node,
	expanded,
	hasChildren,
	elementProps,
	tree,
}: RenderTreeNodePayload) {
	const checked = tree.isNodeChecked(node.value)
	const nodeLabel = typeof node.label === "string" ? node.label : node.value

	function handleToggleChecked(event: MouseEvent) {
		event.stopPropagation()
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
		</div>
	)
}

export function OrganizationalUnitTree({
	data,
	value,
	onChange,
	label,
	error,
	searchPlaceholder = "Search",
	nothingFoundMessage = "No organizational units found",
}: OrganizationalUnitTreeProps) {
	const [search, setSearch] = useState("")
	const tree = useTree({
		checkStrictly: true,
		checkedState: value,
		onCheckedStateChange: handleCheckedStateChange,
		initialExpandedState: getTreeExpandedState(data, "*"),
	})

	const filteredData = useMemo(
		() => (search.trim() ? filterTreeData(data, search) : data),
		[data, search],
	)

	function handleCheckedStateChange(nextValue: string[]) {
		if(arePathListsEqual(value, nextValue)) return
		onChange(nextValue)
	}

	function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
		const nextSearch = event.currentTarget.value
		setSearch(nextSearch)
		if(nextSearch.trim()) {
			tree.setExpandedState(getTreeExpandedState(filterTreeData(data, nextSearch), "*"))
			return
		}
		tree.setExpandedState(getTreeExpandedState(data, "*"))
	}

	return (
		<Input.Wrapper label={ label } error={ error } className={ clsx(classes.root) }>
			<div className={ clsx(classes.panel) }>
				<TextInput
					placeholder={ searchPlaceholder }
					aria-label={ typeof label === "string" ? `Search ${label.toLowerCase()}` : "Search organizational units" }
					leftSection={ <IconSearch size={ 16 } /> }
					value={ search }
					onChange={ handleSearchChange }
					classNames={ { input: classes.search } }
				/>
				{ filteredData.length > 0
					? (
						<Tree
							className={ clsx(classes.tree) }
							data={ filteredData }
							tree={ tree }
							expandOnClick={ false }
							levelOffset={ 22 }
							renderNode={ (payload) => <OrganizationalUnitNode { ...payload } /> }
						/>
					)
					: (
						<Text className={ clsx(classes.empty) }>
							{ nothingFoundMessage }
						</Text>
					) }
			</div>
		</Input.Wrapper>
	)
}
