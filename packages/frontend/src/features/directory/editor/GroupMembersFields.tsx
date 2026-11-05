import { Button, Group, Select, Stack, Text } from "@mantine/core"

import {
	type DirectoryGroupMemberRole,
	directoryGroupMemberRoles,
	type DirectoryUser,
} from "@/shared/directoryFixtures"
import { type DirectoryGroupUpdate } from "@/shared/directoryUpdate"

interface GroupMembersFieldsProps {
	value: DirectoryGroupUpdate
	users: readonly DirectoryUser[]
	disabled: boolean
	onChange: (value: DirectoryGroupUpdate) => void
}

const roleOptions: Array<{ value: DirectoryGroupMemberRole, label: string }> = [
	{ value: directoryGroupMemberRoles.owner, label: "Owner" },
	{ value: directoryGroupMemberRoles.manager, label: "Manager" },
	{ value: directoryGroupMemberRoles.member, label: "Member" },
]

export function GroupMembersFields({
	value,
	users,
	disabled,
	onChange,
}: GroupMembersFieldsProps) {
	const memberEmails = new Set(value.members.map((member) => member.email))
	const availableUsers = users.filter((user) => !memberEmails.has(user.email))

	return (
		<Stack gap="sm">
			{ value.members.map((member) => (
				<Group key={ member.email } justify="space-between" wrap="nowrap">
					<Text>{ member.email }</Text>
					<Group gap="xs" wrap="nowrap">
						<Select
							aria-label={ `Role for ${ member.email }` }
							data={ roleOptions }
							value={ member.role }
							disabled={ disabled }
							allowDeselect={ false }
							w={ 140 }
							onChange={ (role) => {
								if(role !== "OWNER" && role !== "MANAGER" && role !== "MEMBER") return
								onChange({
									...value,
									members: value.members.map((current) => (
										current.email === member.email ? { ...current, role } : current
									)),
								})
							} }
						/>
						<Button
							variant="default"
							disabled={ disabled }
							onClick={ () => onChange({
								...value,
								members: value.members.filter((current) => current.email !== member.email),
							}) }
						>
							Remove
						</Button>
					</Group>
				</Group>
			)) }
			<Select
				label="Add member"
				placeholder="Choose a user"
				data={ availableUsers.map((user) => ({ value: user.email, label: user.displayName })) }
				value={ null }
				disabled={ disabled || availableUsers.length === 0 }
				onChange={ (email) => {
					if(!email) return
					onChange({
						...value,
						members: [...value.members, { email, role: directoryGroupMemberRoles.member }],
					})
				} }
			/>
		</Stack>
	)
}
