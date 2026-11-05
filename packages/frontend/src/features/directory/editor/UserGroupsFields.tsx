import { Stack, Text, TextInput } from "@mantine/core"
import { IconCheck, IconSearch } from "@tabler/icons-react"
import { useMemo, useState } from "react"

import { type DirectoryGroup } from "@/shared/directoryFixtures"
import { type DirectoryUserUpdate } from "@/shared/directoryUpdate"

import { filterDirectoryGroups } from "../GroupsTable/filterDirectoryGroups"
import { GROUP_ROW_HEIGHT, groupListWindow } from "./groupListWindow"
import * as classes from "./UserGroupsFields.css"

interface UserGroupsFieldsProps {
	value: DirectoryUserUpdate
	groups: readonly DirectoryGroup[]
	disabled: boolean
	onChange: (value: DirectoryUserUpdate) => void
}

export function UserGroupsFields({
	value,
	groups,
	disabled,
	onChange,
}: UserGroupsFieldsProps) {
	const [searchQuery, setSearchQuery] = useState("")
	const [scrollTop, setScrollTop] = useState(0)
	const selected = new Set(value.groupIds)
	const filteredGroups = useMemo(() => {
		const ordered = [...groups].sort((left, right) => left.name.localeCompare(right.name))
		return filterDirectoryGroups(ordered, searchQuery)
	}, [groups, searchQuery])
	const window = groupListWindow(scrollTop, filteredGroups.length)
	const visibleGroups = filteredGroups.slice(window.start, window.end)

	function toggle(groupId: string) {
		const groupIds = selected.has(groupId)
			? value.groupIds.filter((id) => id !== groupId)
			: [...value.groupIds, groupId]
		onChange({ ...value, groupIds })
	}

	return (
		<Stack gap="sm">
			<TextInput
				aria-label="Search groups"
				placeholder="Search groups"
				leftSection={ <IconSearch size={ 16 } /> }
				value={ searchQuery }
				onChange={ (event) => {
					setSearchQuery(event.currentTarget.value)
					setScrollTop(0)
				} }
			/>
			{ filteredGroups.length === 0
				? <Text c="dimmed">No groups found</Text>
				: (
					<div
						className={ classes.scroller }
						onScroll={ (event) => setScrollTop(event.currentTarget.scrollTop) }
					>
						<div style={ { height: filteredGroups.length * GROUP_ROW_HEIGHT, position: "relative" } }>
							{ visibleGroups.map((group, index) => {
								const isSelected = selected.has(group.id)
								return (
									<button
										key={ group.id }
										type="button"
										className={ classes.row }
										aria-pressed={ isSelected }
										disabled={ disabled }
										style={ { transform: `translateY(${ (window.start + index) * GROUP_ROW_HEIGHT }px)` } }
										onClick={ () => toggle(group.id) }
									>
										<span className={ classes.identity }>
											<span>{ group.name }</span>
											<span className={ classes.email }>{ group.email }</span>
										</span>
										{ isSelected ? <IconCheck size={ 16 } aria-hidden /> : null }
									</button>
								)
							}) }
						</div>
					</div>
				) }
		</Stack>
	)
}
