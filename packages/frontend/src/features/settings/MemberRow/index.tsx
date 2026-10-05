import { Button, Group, Text } from "@mantine/core"

import { type MembershipRecord } from "@/shared/workspace"

interface MemberRowProps {
	member: Pick<MembershipRecord, "uid" | "email" | "role">
	canRemove: boolean
	onRemove: (uid: string) => void
}

export function MemberRow({ member, canRemove, onRemove }: MemberRowProps) {
	function handleRemove() {
		onRemove(member.uid)
	}

	return (
		<Group justify="space-between">
			<Text>{ member.email } ({ member.role })</Text>
			{ canRemove
				? (
					<Button variant="default" onClick={ handleRemove }>
						Remove
					</Button>
				)
				: null }
		</Group>
	)
}
