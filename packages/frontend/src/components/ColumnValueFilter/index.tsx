import { Button, Checkbox, Group, ScrollArea, Stack, Text, TextInput } from "@mantine/core"

import {
	type ColumnFilterState,
	emptyColumnFilterState,
	formatColumnFilterValue,
} from "@/frontend/lib/tableView"

import * as classes from "./ColumnValueFilter.css"

interface ColumnValueFilterProps {
	label: string
	values: readonly string[]
	filter: ColumnFilterState
	onChange: (filter: ColumnFilterState) => void
	onClose: () => void
}

export function ColumnValueFilter({
	label,
	values,
	filter,
	onChange,
	onClose,
}: ColumnValueFilterProps) {
	const selectedValues = filter.selectedValues ?? [...values]
	const selectedValueSet = new Set(selectedValues)
	const query = filter.query
	const normalizedQuery = query.trim().toLowerCase()
	const visibleValues = normalizedQuery.length === 0
		? values
		: values.filter((value) => formatColumnFilterValue(value).toLowerCase().includes(normalizedQuery))
	const areAllVisibleSelected = visibleValues.length > 0
		&& visibleValues.every((value) => selectedValueSet.has(value))

	function updateSelectedValues(nextSelectedValues: string[]) {
		const selectsAllValues = nextSelectedValues.length === values.length
			&& values.every((value) => nextSelectedValues.includes(value))
		onChange({
			query,
			selectedValues: selectsAllValues ? null : nextSelectedValues,
		})
	}

	function handleToggleValue(value: string, isChecked: boolean) {
		if(isChecked) {
			updateSelectedValues([...selectedValueSet, value])
			return
		}
		updateSelectedValues(selectedValues.filter((selectedValue) => selectedValue !== value))
	}

	function handleToggleVisible(isChecked: boolean) {
		if(isChecked) {
			const nextSelected = new Set(selectedValues)
			for(const value of visibleValues) nextSelected.add(value)
			updateSelectedValues([...nextSelected])
			return
		}
		const hiddenSelected = selectedValues.filter((value) => !visibleValues.includes(value))
		updateSelectedValues(hiddenSelected)
	}

	return (
		<Stack gap="xs" className={ classes.root }>
			<TextInput
				aria-label={ `Filter ${ label }` }
				placeholder={ `Search ${ label }` }
				value={ query }
				onChange={ (event) => onChange({
					query: event.currentTarget.value,
					selectedValues: filter.selectedValues,
				}) }
				data-autofocus
			/>
			<Group gap="xs">
				<Button
					variant="subtle"
					size="compact-xs"
					disabled={ areAllVisibleSelected || visibleValues.length === 0 }
					onClick={ () => handleToggleVisible(true) }
				>
					Select all
				</Button>
				<Button
					variant="subtle"
					size="compact-xs"
					disabled={ !visibleValues.some((value) => selectedValueSet.has(value)) }
					onClick={ () => handleToggleVisible(false) }
				>
					Clear
				</Button>
			</Group>
			<ScrollArea.Autosize mah={ 220 } type="scroll">
				<Stack gap={ 6 }>
					{ visibleValues.length === 0
						? (
							<Text size="sm" c="dimmed">No matching values</Text>
						)
						: visibleValues.map((value) => (
							<Checkbox
								key={ value.length === 0 ? "__blank__" : value }
								label={ formatColumnFilterValue(value) }
								checked={ selectedValueSet.has(value) }
								onChange={ (event) => handleToggleValue(value, event.currentTarget.checked) }
							/>
						)) }
				</Stack>
			</ScrollArea.Autosize>
			<Button
				variant="default"
				size="xs"
				onClick={ () => {
					onChange(emptyColumnFilterState())
					onClose()
				} }
			>
				Reset
			</Button>
		</Stack>
	)
}
