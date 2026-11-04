import { Button, Checkbox, Paper, Stack } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconColumns3 } from "@tabler/icons-react"

import { type TableColumnDefinition } from "@/frontend/lib/tableView"

import * as classes from "./TableColumnPicker.css"

interface TableColumnPickerProps<TRow> {
	columns: readonly TableColumnDefinition<TRow>[]
	visibleColumnIds: readonly string[]
	onChange: (visibleColumnIds: string[]) => void
}

export function TableColumnPicker<TRow>({
	columns,
	visibleColumnIds,
	onChange,
}: TableColumnPickerProps<TRow>) {
	const [opened, { toggle, close }] = useDisclosure(false)
	const visibleIdSet = new Set(visibleColumnIds)

	function handleToggle(columnId: string, isChecked: boolean) {
		if(isChecked) {
			onChange(columns
				.map((column) => column.id)
				.filter((id) => id === columnId || visibleIdSet.has(id)))
			return
		}

		if(visibleColumnIds.length <= 1) return

		onChange(visibleColumnIds.filter((id) => id !== columnId))
	}

	return (
		<div className={ classes.root }>
			<Button
				variant="default"
				leftSection={ <IconColumns3 size={ 16 } /> }
				onClick={ toggle }
				aria-expanded={ opened }
			>
				Columns
			</Button>
			{ opened
				? (
					<Paper className={ classes.dropdown } withBorder shadow="md" p="xs" role="dialog" aria-label="Visible columns">
						<Stack gap="xs">
							{ columns.map((column) => {
								const isChecked = visibleIdSet.has(column.id)
								const isOnlyVisibleColumn = isChecked && visibleColumnIds.length === 1
								return (
									<Checkbox
										key={ column.id }
										label={ column.label }
										checked={ isChecked }
										disabled={ isOnlyVisibleColumn }
										onChange={ (event) => handleToggle(column.id, event.currentTarget.checked) }
									/>
								)
							}) }
							<Button variant="subtle" size="xs" onClick={ close }>
								Done
							</Button>
						</Stack>
					</Paper>
				)
				: null }
		</div>
	)
}
