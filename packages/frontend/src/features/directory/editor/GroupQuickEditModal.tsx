import { Modal } from "@mantine/core"

import { type DirectoryGroup, type DirectoryUser } from "@/shared/directoryFixtures"
import { type DirectoryGroupUpdateRequest } from "@/shared/directoryUpdate"

import { GroupEditor } from "./GroupEditor"

interface GroupQuickEditModalProps {
	group: DirectoryGroup
	users: readonly DirectoryUser[]
	opened: boolean
	canSave: boolean
	isSaving: boolean
	onClose: () => void
	onSave: (update: DirectoryGroupUpdateRequest) => void
}

export function GroupQuickEditModal({
	group,
	users,
	opened,
	canSave,
	isSaving,
	onClose,
	onSave,
}: GroupQuickEditModalProps) {
	return (
		<Modal
			opened={ opened }
			onClose={ onClose }
			title={ group.name }
			size="lg"
			centered
		>
			{ opened
				? (
					<GroupEditor
						key={ group.id }
						group={ group }
						users={ users }
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
