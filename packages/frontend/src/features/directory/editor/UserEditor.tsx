import { Button, Group, Stack, Tabs, Title } from "@mantine/core"
import { useState } from "react"

import { type DirectoryGroup, type DirectoryOrganizationalUnit, type DirectoryUser } from "@/shared/directoryFixtures"
import { type DirectoryUserUpdateRequest } from "@/shared/directoryUpdate"

import { directoryUserUpdateFromUser } from "./directoryUserUpdateFromUser"
import { UserContactFields } from "./UserContactFields"
import { UserEmployeeFields } from "./UserEmployeeFields"
import { UserGroupsFields } from "./UserGroupsFields"
import { UserProfileFields } from "./UserProfileFields"

interface UserEditorProps {
	user: DirectoryUser
	groups: readonly DirectoryGroup[]
	organizationalUnits: readonly DirectoryOrganizationalUnit[]
	departments: readonly string[] | undefined
	canSave: boolean
	isSaving: boolean
	onCancel: () => void
	onSave: (update: DirectoryUserUpdateRequest) => void
}

export function UserEditor({
	user,
	groups,
	organizationalUnits,
	departments,
	canSave,
	isSaving,
	onCancel,
	onSave,
}: UserEditorProps) {
	const [baseline] = useState(() => directoryUserUpdateFromUser(user, groups))
	const [draft, setDraft] = useState(() => directoryUserUpdateFromUser(user, groups))
	const fieldsDisabled = !canSave || isSaving

	return (
		<Stack gap="md">
			<Title order={ 2 } size="h4">{ user.email }</Title>
			<Tabs defaultValue="profile">
				<Tabs.List>
					<Tabs.Tab value="profile">Profile</Tabs.Tab>
					<Tabs.Tab value="contact">Contact</Tabs.Tab>
					<Tabs.Tab value="employee">Employee</Tabs.Tab>
					<Tabs.Tab value="groups">Groups</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="profile" pt="md">
					<UserProfileFields
						value={ draft }
						organizationalUnits={ organizationalUnits }
						disabled={ fieldsDisabled }
						onChange={ setDraft }
					/>
				</Tabs.Panel>
				<Tabs.Panel value="contact" pt="md">
					<UserContactFields
						value={ draft }
						disabled={ fieldsDisabled }
						onChange={ setDraft }
					/>
				</Tabs.Panel>
				<Tabs.Panel value="employee" pt="md">
					<UserEmployeeFields
						value={ draft }
						departments={ departments }
						disabled={ fieldsDisabled }
						onChange={ setDraft }
					/>
				</Tabs.Panel>
				<Tabs.Panel value="groups" pt="md">
					<UserGroupsFields
						value={ draft }
						groups={ groups }
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
