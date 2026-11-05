import {
	filterTreeData,
	getTreeExpandedState,
	Input,
	Text,
	TextInput,
	Tree,
	type TreeNodeData,
	useTree,
} from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import clsx from "clsx"
import { type ChangeEvent, type ReactNode, useMemo, useState } from "react"

import { OrganizationalUnitNode } from "./OrganizationalUnitNode"
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
	disabledPaths?: ReadonlyMap<string, string>
}

export function OrganizationalUnitTree({
	data,
	value,
	onChange,
	label,
	error,
	searchPlaceholder = "Search",
	nothingFoundMessage = "No organizational units found",
	disabledPaths,
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
		const allowed = nextValue.filter((path) => {
			if(value.includes(path)) return true
			return !disabledPaths?.has(path)
		})
		if(arePathListsEqual(value, allowed)) return
		onChange(allowed)
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
		<Input.Wrapper
			label={ label }
			error={ error }
			className={ clsx(classes.root) }
			classNames={ { label: classes.fieldLabel } }
		>
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
							checkOnSpace
							levelOffset={ 22 }
							renderNode={ (payload) => (
								<OrganizationalUnitNode
									{ ...payload }
									disabledReason={ disabledPaths?.get(payload.node.value) }
								/>
							) }
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
