import { Button, Group, Select, Text } from "@mantine/core"

import {
	type AccessRecord,
	type MembershipRole,
	membershipRoleLabels,
	membershipRoles,
} from "@/shared/workspace"

interface AccessRowProps {
	access: AccessRecord
	canManage: boolean
	canAssignSuperAdmin: boolean
	isPending: boolean
	onRoleChange: (email: string, role: MembershipRole) => void
	onRemove: (email: string) => void
}

function roleOptions(canAssignSuperAdmin: boolean) {
	return Object.values(membershipRoles)
		.filter((role) => canAssignSuperAdmin || role !== membershipRoles.superAdmin)
		.map((role) => ({
			value: role,
			label: membershipRoleLabels[role],
		}))
}

export function AccessRow({
	access,
	canManage,
	canAssignSuperAdmin,
	isPending,
	onRoleChange,
	onRemove,
}: AccessRowProps) {
	function handleRoleChange(value: string | null) {
		if(!value) return
		if(value !== membershipRoles.superAdmin
			&& value !== membershipRoles.admin
			&& value !== membershipRoles.editor
			&& value !== membershipRoles.viewer) {
			return
		}
		onRoleChange(access.email, value)
	}

	function handleRemove() {
		onRemove(access.email)
	}

	if(!canManage) {
		return (
			<Group justify="space-between">
				<Text>{ access.email }</Text>
				<Text c="dimmed">{ membershipRoleLabels[access.role] }</Text>
			</Group>
		)
	}

	return (
		<Group justify="space-between" align="flex-end" wrap="nowrap">
			<Text style={ { flex: 1 } }>{ access.email }</Text>
			<Select
				aria-label={ `Role for ${access.email}` }
				data={ roleOptions(canAssignSuperAdmin) }
				value={ access.role }
				onChange={ handleRoleChange }
				disabled={ isPending }
				w={ 160 }
			/>
			<Button variant="default" onClick={ handleRemove } disabled={ isPending }>
				Remove
			</Button>
		</Group>
	)
}
