import { Modal } from "@mantine/core"

import { type DirectoryGroup, type DirectoryOrganizationalUnit, type DirectoryUser } from "@/shared/directoryFixtures"
import { type DirectoryUserUpdateRequest } from "@/shared/directoryUpdate"

import { UserEditor } from "./UserEditor"

interface UserQuickEditModalProps {
	user: DirectoryUser
	groups: readonly DirectoryGroup[]
	organizationalUnits: readonly DirectoryOrganizationalUnit[]
	departments: readonly string[] | undefined
	opened: boolean
	canSave: boolean
	isSaving: boolean
	onClose: () => void
	onSave: (update: DirectoryUserUpdateRequest) => void
}

export function UserQuickEditModal({
	user,
	groups,
	organizationalUnits,
	departments,
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
						departments={ departments }
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
