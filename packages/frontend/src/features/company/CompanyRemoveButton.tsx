import { ActionIcon, Tooltip } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"

interface CompanyRemoveButtonProps {
	label: string
	disabled: boolean
	onClick: () => void
}

export function CompanyRemoveButton({ label, disabled, onClick }: CompanyRemoveButtonProps) {
	return (
		<Tooltip label={ label }>
			<ActionIcon
				variant="subtle"
				color="red"
				size="sm"
				disabled={ disabled }
				aria-label={ label }
				onClick={ onClick }
			>
				<IconTrash size={ 16 } aria-hidden />
			</ActionIcon>
		</Tooltip>
	)
}
