import { Autocomplete, Button, Group, Select, Stack, Text, Title } from "@mantine/core"
import { useState } from "react"

import { APP_NAME } from "@/frontend/lib/appName"
import { useDirectoryQuery } from "@/frontend/queries/directory"
import {
	useRemoveAccess,
	useSetAccess,
	useWorkspaceQuery,
} from "@/frontend/queries/workspace"
import { type DirectoryUser } from "@/shared/directoryFixtures"
import {
	canManageAccess,
	type MembershipRole,
	membershipRoleLabels,
	membershipRoles,
} from "@/shared/workspace"

import { AccessRow } from "../AccessRow"
import { notifySettingsError, notifySettingsSuccess } from "../notifySettingsError"

function directoryUserLabel(directoryUser: DirectoryUser): string {
	return `${ directoryUser.displayName } (${ directoryUser.email })`
}

const assignableRoles = [
	membershipRoles.superAdmin,
	membershipRoles.admin,
	membershipRoles.editor,
	membershipRoles.viewer,
] as const

export function PermissionsPanel() {
	const workspace = useWorkspaceQuery()
	const setAccess = useSetAccess()
	const removeAccess = useRemoveAccess()
	const [search, setSearch] = useState("")
	const [selectedEmail, setSelectedEmail] = useState("")
	const [role, setRole] = useState<MembershipRole>(membershipRoles.editor)

	const session = workspace.data
	const customer = session?.customer ?? null
	const membership = session?.membership ?? null
	const canManage = membership ? canManageAccess(membership.role) : false
	const canAssignSuperAdmin = membership?.role === membershipRoles.superAdmin
	const directory = useDirectoryQuery({ enabled: Boolean(customer) && canManage })
	const accessEmails = new Set((session?.access ?? []).map((entry) => entry.email))
	const directoryOptions = (directory.data?.users ?? [])
		.filter((directoryUser) => !accessEmails.has(directoryUser.email))
		.map((directoryUser) => ({
			value: directoryUser.email,
			label: directoryUserLabel(directoryUser),
		}))
	const selectedOption = directoryOptions.find((option) => option.value === selectedEmail)
	const canAdd = Boolean(selectedOption && selectedOption.label === search)
	const roleData = assignableRoles
		.filter((value) => canAssignSuperAdmin || value !== membershipRoles.superAdmin)
		.map((value) => ({ value, label: membershipRoleLabels[value] }))

	function handleSearchChange(value: string) {
		setSearch(value)
	}

	function handleSelect(email: string) {
		setSelectedEmail(email)
	}

	function handleRoleSelect(value: string | null) {
		if(!value) return
		if(value !== membershipRoles.superAdmin
			&& value !== membershipRoles.admin
			&& value !== membershipRoles.editor
			&& value !== membershipRoles.viewer) {
			return
		}
		setRole(value)
	}

	function handleAdd() {
		if(!canAdd) return
		setAccess.mutate({ email: selectedEmail, role }, {
			onSuccess: () => {
				setSearch("")
				setSelectedEmail("")
				notifySettingsSuccess("Access updated")
			},
			onError: (error) => notifySettingsError(error, "Failed to update access"),
		})
	}

	function handleRoleChange(email: string, nextRole: MembershipRole) {
		setAccess.mutate({ email, role: nextRole }, {
			onSuccess: () => notifySettingsSuccess("Access updated"),
			onError: (error) => notifySettingsError(error, "Failed to update access"),
		})
	}

	function handleRemove(email: string) {
		removeAccess.mutate({ email }, {
			onSuccess: () => notifySettingsSuccess("Access removed"),
			onError: (error) => notifySettingsError(error, "Failed to remove access"),
		})
	}

	if(!session || !customer || !membership) return null

	return (
		<Stack gap="sm">
			<Title order={ 2 } size="h4">Permissions</Title>
			<Text>
				Choose who from your Workspace can use { APP_NAME }, and what they can do.
			</Text>
			{ session.access.map((entry) => (
				<AccessRow
					key={ entry.email }
					access={ entry }
					canManage={ canManage }
					canAssignSuperAdmin={ canAssignSuperAdmin }
					isPending={ setAccess.isPending || removeAccess.isPending }
					onRoleChange={ handleRoleChange }
					onRemove={ handleRemove }
				/>
			)) }
			{ canManage
				? (
					<Group align="flex-end" wrap="wrap">
						<Autocomplete
							label="Add Workspace user"
							description="Pick someone from your Directory."
							placeholder="Search by name or email"
							data={ directoryOptions }
							value={ search }
							onChange={ handleSearchChange }
							onOptionSubmit={ handleSelect }
							limit={ 8 }
							style={ { flex: 1, minWidth: 220 } }
						/>
						<Select
							label="Role"
							data={ roleData }
							value={ role }
							onChange={ handleRoleSelect }
							w={ 160 }
						/>
						<Button
							disabled={ !canAdd || setAccess.isPending }
							loading={ setAccess.isPending }
							onClick={ handleAdd }
						>
							Add
						</Button>
					</Group>
				)
				: null }
		</Stack>
	)
}
