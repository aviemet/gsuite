import { Button, Menu, Text } from "@mantine/core"
import { IconChevronDown, IconDeviceFloppy, IconRocket } from "@tabler/icons-react"

interface ApplyMenuProps {
	isSaving: boolean
	isApplying: boolean
	onSave: () => void
	onSaveAndDeploy: () => void
}

export function ApplyMenu({
	isSaving,
	isApplying,
	onSave,
	onSaveAndDeploy,
}: ApplyMenuProps) {
	return (
		<Menu position="top-end" shadow="md" width={ 280 } transitionProps={ { duration: 0 } }>
			<Menu.Target>
				<Button
					type="button"
					rightSection={ <IconChevronDown size={ 16 } aria-hidden /> }
					loading={ isSaving }
					disabled={ isApplying }
				>
					Apply
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item
					leftSection={ <IconDeviceFloppy size={ 16 } aria-hidden /> }
					onClick={ onSave }
				>
					<Text size="sm">Save</Text>
					<Text size="xs" c="dimmed">Store this assignment. Mailboxes are not updated.</Text>
				</Menu.Item>
				<Menu.Item
					leftSection={ <IconRocket size={ 16 } aria-hidden /> }
					onClick={ onSaveAndDeploy }
				>
					<Text size="sm">Save and deploy</Text>
					<Text size="xs" c="dimmed">Store this assignment and update the matched mailboxes.</Text>
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	)
}
