import { Button, Group, Stack, Tabs } from "@mantine/core"
import { useState } from "react"

import { type DirectoryGroup, type DirectoryUser } from "@/shared/directoryFixtures"
import { type DirectoryGroupUpdateRequest } from "@/shared/directoryUpdate"

import { directoryGroupUpdateFromGroup } from "./directoryGroupUpdateFromGroup"
import { GroupDetailsFields } from "./GroupDetailsFields"
import { GroupMembersFields } from "./GroupMembersFields"

interface GroupEditorProps {
	group: DirectoryGroup
	users: readonly DirectoryUser[]
	canSave: boolean
	isSaving: boolean
	onCancel: () => void
	onSave: (update: DirectoryGroupUpdateRequest) => void
}

export function GroupEditor({
	group,
	users,
	canSave,
	isSaving,
	onCancel,
	onSave,
}: GroupEditorProps) {
	const [baseline] = useState(() => directoryGroupUpdateFromGroup(group))
	const [draft, setDraft] = useState(() => directoryGroupUpdateFromGroup(group))
	const fieldsDisabled = !canSave || isSaving

	return (
		<Stack gap="md">
			<Tabs defaultValue="details">
				<Tabs.List>
					<Tabs.Tab value="details">Details</Tabs.Tab>
					<Tabs.Tab value="members">Members</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="details" pt="md">
					<GroupDetailsFields
						value={ draft }
						disabled={ fieldsDisabled }
						onChange={ setDraft }
					/>
				</Tabs.Panel>
				<Tabs.Panel value="members" pt="md">
					<GroupMembersFields
						value={ draft }
						users={ users }
						disabled={ fieldsDisabled }
						onChange={ setDraft }
					/>
				</Tabs.Panel>
			</Tabs>
			<Group justify="flex-end">
				<Button variant="default" onClick={ onCancel } disabled={ isSaving }>
					Cancel
				</Button>
				{ canSave
					? (
						<Button loading={ isSaving } onClick={ () => onSave({ baseline, next: draft }) }>
							Save
						</Button>
					)
					: null }
			</Group>
		</Stack>
	)
}
