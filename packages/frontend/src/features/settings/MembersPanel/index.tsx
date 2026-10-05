import { Alert, Button, Group, Stack, Text, TextInput, Title } from "@mantine/core"
import { type ChangeEvent, useState } from "react"

import { useInviteMember, useRemoveMember, useWorkspaceQuery } from "@/frontend/queries/workspace"
import { membershipRoles } from "@/shared/workspace"

import { MemberRow } from "../MemberRow"
import { notifySettingsError, notifySettingsSuccess } from "../notifySettingsError"

export function MembersPanel() {
	const workspace = useWorkspaceQuery()
	const invite = useInviteMember()
	const remove = useRemoveMember()
	const [inviteEmail, setInviteEmail] = useState("")

	const session = workspace.data
	const customer = session?.customer ?? null
	const membership = session?.membership ?? null
	const isOwner = membership?.role === membershipRoles.owner

	function handleInviteEmailChange(event: ChangeEvent<HTMLInputElement>) {
		setInviteEmail(event.currentTarget.value)
	}

	function handleInvite() {
		invite.mutate({ email: inviteEmail }, {
			onSuccess: () => {
				setInviteEmail("")
				notifySettingsSuccess("Invite sent")
			},
			onError: (error) => notifySettingsError(error, "Failed to invite member"),
		})
	}

	function handleRemove(uid: string) {
		remove.mutate({ uid }, {
			onError: (error) => notifySettingsError(error, "Failed to remove member"),
		})
	}

	if(!customer || !membership || !session) {
		return <Alert>Connect a Workspace domain, or accept an invite, to manage members.</Alert>
	}

	return (
		<Stack gap="sm">
			<Title order={ 2 } size="h4">Members</Title>
			{ session.members.map((member) => (
				<MemberRow
					key={ member.uid }
					member={ member }
					canRemove={ isOwner && member.role !== membershipRoles.owner }
					onRemove={ handleRemove }
				/>
			)) }
			{ session.invites.map((pendingInvite) => (
				<Text key={ pendingInvite.email }>Invited: { pendingInvite.email }</Text>
			)) }
			{ isOwner
				? (
					<Group align="flex-end">
						<TextInput
							label="Invite by email"
							value={ inviteEmail }
							onChange={ handleInviteEmailChange }
						/>
						<Button loading={ invite.isPending } onClick={ handleInvite }>
							Invite
						</Button>
					</Group>
				)
				: null }
		</Stack>
	)
}
