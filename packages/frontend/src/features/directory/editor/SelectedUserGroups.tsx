import { ActionIcon, Badge, Select, Text } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import { useId, useLayoutEffect, useRef } from "react"

import {
	type DirectoryGroup,
	type DirectoryGroupMemberRole,
	directoryGroupMemberRoleChoices,
	isDirectoryGroupMemberRole,
} from "@/shared/directoryFixtures"

import * as classes from "./SelectedUserGroups.css"
import * as choiceClasses from "./userGroupChoice.css"
import { revealRowScrollTop } from "./userGroupMembership"

export interface SelectedUserGroup {
	group: DirectoryGroup
	role: DirectoryGroupMemberRole
}

interface SelectedUserGroupsProps {
	groups: readonly SelectedUserGroup[]
	justAddedGroupId: string | null
	disabled: boolean
	onRemove: (groupId: string) => void
	onRoleChange: (groupId: string, role: DirectoryGroupMemberRole) => void
}

interface SelectedUserGroupRowProps {
	group: DirectoryGroup
	role: DirectoryGroupMemberRole
	justAdded: boolean
	disabled: boolean
	onRemove: (groupId: string) => void
	onRoleChange: (groupId: string, role: DirectoryGroupMemberRole) => void
}

function SelectedUserGroupRow({
	group,
	role,
	justAdded,
	disabled,
	onRemove,
	onRoleChange,
}: SelectedUserGroupRowProps) {
	function handleRemove() {
		onRemove(group.id)
	}

	function handleRoleChange(nextRole: string | null) {
		if(!isDirectoryGroupMemberRole(nextRole)) return
		onRoleChange(group.id, nextRole)
	}

	return (
		<li className={ classes.item }>
			<div
				className={ classes.row }
				data-group-id={ group.id }
				data-just-added={ justAdded ? "true" : undefined }
			>
				<span className={ choiceClasses.identity }>
					<span className={ choiceClasses.name }>{ group.name }</span>
					<span className={ choiceClasses.email }>{ group.email }</span>
				</span>
				<span className={ classes.controls }>
					<Select
						aria-label={ `Role in ${ group.name }` }
						data={ directoryGroupMemberRoleChoices }
						value={ role }
						disabled={ disabled }
						allowDeselect={ false }
						w={ 132 }
						size="xs"
						onChange={ handleRoleChange }
					/>
					<ActionIcon
						type="button"
						variant="subtle"
						color="gray"
						size="lg"
						aria-label={ `Remove ${ group.name } (${ group.email })` }
						disabled={ disabled }
						onClick={ handleRemove }
					>
						<IconTrash size={ 16 } />
					</ActionIcon>
				</span>
			</div>
		</li>
	)
}

export function SelectedUserGroups({
	groups,
	justAddedGroupId,
	disabled,
	onRemove,
	onRoleChange,
}: SelectedUserGroupsProps) {
	const headingId = useId()
	const listRef = useRef<HTMLUListElement>(null)

	useLayoutEffect(() => {
		const list = listRef.current
		if(!list || justAddedGroupId === null) return
		const rows = list.querySelectorAll<HTMLElement>("[data-group-id]")
		for(const row of rows) {
			if(row.dataset.groupId !== justAddedGroupId) continue
			list.scrollTop = revealRowScrollTop(
				list.scrollTop,
				list.clientHeight,
				row.offsetTop,
				row.offsetHeight,
			)
			return
		}
	}, [groups, justAddedGroupId])

	return (
		<section className={ classes.panel } aria-labelledby={ headingId }>
			<div className={ classes.header }>
				<Text id={ headingId } component="h3" size="sm" className={ classes.heading }>
					Selected
				</Text>
				<Badge variant="light" color="harbor">{ groups.length }</Badge>
			</div>
			{ groups.length === 0
				? <Text size="sm" c="dimmed" className={ classes.empty }>No groups selected</Text>
				: (
					<ul ref={ listRef } className={ classes.list }>
						{ groups.map((entry) => (
							<SelectedUserGroupRow
								key={ entry.group.id }
								group={ entry.group }
								role={ entry.role }
								justAdded={ entry.group.id === justAddedGroupId }
								disabled={ disabled }
								onRemove={ onRemove }
								onRoleChange={ onRoleChange }
							/>
						)) }
					</ul>
				) }
		</section>
	)
}
