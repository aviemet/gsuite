import { Modal } from "@mantine/core"

import { type DirectoryGroup, type DirectoryOrganizationalUnit, type DirectoryUser } from "@/shared/directoryFixtures"
import { type DirectoryUserUpdate } from "@/shared/directoryUpdate"

import { UserEditor } from "./UserEditor"

interface UserQuickEditModalProps {
	user: DirectoryUser
	groups: readonly DirectoryGroup[]
	organizationalUnits: readonly DirectoryOrganizationalUnit[]
	opened: boolean
	canSave: boolean
	isSaving: boolean
	onClose: () => void
	onSave: (update: DirectoryUserUpdate) => void
}

export function UserQuickEditModal({
	user,
	groups,
	organizationalUnits,
	opened,
	canSave,
	isSaving,
	onClose,
	onSave,
}: UserQuickEditModalProps) {
	return (
		<Modal
			opened={ opened }
			onClose={ onClose }
			title={ user.displayName }
			size="lg"
			centered
		>
			{ opened
				? (
					<UserEditor
						key={ user.email }
						user={ user }
						groups={ groups }
						organizationalUnits={ organizationalUnits }
						canSave={ canSave }
						isSaving={ isSaving }
						onCancel={ onClose }
						onSave={ onSave }
					/>
				)
				: null }
		</Modal>
	)
}
