import { Text, TextInput, UnstyledButton } from "@mantine/core"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import clsx from "clsx"
import { type ChangeEvent, type KeyboardEvent, type MouseEvent, type UIEvent, useState } from "react"

import { type DirectoryGroup } from "@/shared/directoryFixtures"

import { GROUP_ROW_HEIGHT, groupListWindow } from "./groupListWindow"
import * as classes from "./UserGroupCatalog.css"
import * as choiceClasses from "./userGroupChoice.css"

interface UserGroupCatalogProps {
	query: string
	groups: readonly DirectoryGroup[]
	statusMessage: string | null
	disabled: boolean
	onQueryChange: (query: string) => void
	onAdd: (groupId: string) => void
}

interface UserGroupCatalogRowProps {
	group: DirectoryGroup
	disabled: boolean
	offset: number
	onAdd: (groupId: string) => void
}

function UserGroupCatalogRow({
	group,
	disabled,
	offset,
	onAdd,
}: UserGroupCatalogRowProps) {
	function handleAdd() {
		onAdd(group.id)
	}

	function handleMouseDown(event: MouseEvent<HTMLButtonElement>) {
		event.preventDefault()
	}

	return (
		<UnstyledButton
			type="button"
			className={ clsx(choiceClasses.choice, classes.row) }
			aria-label={ `Add ${ group.name } (${ group.email })` }
			disabled={ disabled }
			style={ { transform: `translateY(${ offset }px)` } }
			onMouseDown={ handleMouseDown }
			onClick={ handleAdd }
		>
			<span className={ choiceClasses.identity }>
				<span className={ choiceClasses.name }>{ group.name }</span>
				<span className={ choiceClasses.email }>{ group.email }</span>
			</span>
			<span className={ choiceClasses.iconAction } aria-hidden="true">
				<IconPlus size={ 16 } />
			</span>
		</UnstyledButton>
	)
}

export function UserGroupCatalog({
	query,
	groups,
	statusMessage,
	disabled,
	onQueryChange,
	onAdd,
}: UserGroupCatalogProps) {
	const [scrollTop, setScrollTop] = useState(0)
	const [previousQuery, setPreviousQuery] = useState(query)
	if(query !== previousQuery) {
		setPreviousQuery(query)
		setScrollTop(0)
	}

	const window = groupListWindow(scrollTop, groups.length)
	const visibleGroups = groups.slice(window.start, window.end)
	const onlyGroup = groups.length === 1 ? groups[0] : undefined

	function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
		onQueryChange(event.currentTarget.value)
	}

	function handleQueryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if(event.key !== "Enter" || disabled || !onlyGroup) return
		event.preventDefault()
		onAdd(onlyGroup.id)
	}

	function handleScroll(event: UIEvent<HTMLDivElement>) {
		setScrollTop(event.currentTarget.scrollTop)
	}

	return (
		<section aria-label="Add a group">
			<TextInput
				label="Add a group"
				placeholder="Search by name or email"
				leftSection={ <IconSearch size={ 16 } /> }
				value={ query }
				autoComplete="off"
				onChange={ handleQueryChange }
				onKeyDown={ handleQueryKeyDown }
			/>
			{ statusMessage
				? (
					<Text size="sm" c="dimmed" aria-live="polite" className={ classes.status }>
						{ statusMessage }
					</Text>
				)
				: (
					<div className={ classes.scroller } onScroll={ handleScroll }>
						<div
							className={ classes.canvas }
							style={ { height: groups.length * GROUP_ROW_HEIGHT } }
						>
							{ visibleGroups.map((group, index) => (
								<UserGroupCatalogRow
									key={ group.id }
									group={ group }
									disabled={ disabled }
									offset={ (window.start + index) * GROUP_ROW_HEIGHT }
									onAdd={ onAdd }
								/>
							)) }
						</div>
					</div>
				) }
		</section>
	)
}
