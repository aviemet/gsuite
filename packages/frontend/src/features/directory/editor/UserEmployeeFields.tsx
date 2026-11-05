import { Stack, TextInput } from "@mantine/core"

import { type DirectoryUserUpdate } from "@/shared/directoryUpdate"

interface UserEmployeeFieldsProps {
	value: DirectoryUserUpdate
	disabled: boolean
	onChange: (value: DirectoryUserUpdate) => void
}

export function UserEmployeeFields({ value, disabled, onChange }: UserEmployeeFieldsProps) {
	function update(patch: Partial<DirectoryUserUpdate>) {
		onChange({ ...value, ...patch })
	}

	return (
		<Stack gap="sm">
			<TextInput
				label="Job title"
				value={ value.jobTitle }
				disabled={ disabled }
				onChange={ (event) => update({ jobTitle: event.currentTarget.value }) }
			/>
			<TextInput
				label="Department"
				value={ value.department }
				disabled={ disabled }
				onChange={ (event) => update({ department: event.currentTarget.value }) }
			/>
			<TextInput
				label="Organization"
				value={ value.organization }
				disabled={ disabled }
				onChange={ (event) => update({ organization: event.currentTarget.value }) }
			/>
			<TextInput
				label="Manager email"
				value={ value.managerEmail }
				disabled={ disabled }
				onChange={ (event) => update({ managerEmail: event.currentTarget.value }) }
			/>
			<TextInput
				label="Employee ID"
				value={ value.employeeId }
				disabled={ disabled }
				onChange={ (event) => update({ employeeId: event.currentTarget.value }) }
			/>
			<TextInput
				label="Cost center"
				value={ value.costCenter }
				disabled={ disabled }
				onChange={ (event) => update({ costCenter: event.currentTarget.value }) }
			/>
			<TextInput
				label="Location"
				value={ value.location }
				disabled={ disabled }
				onChange={ (event) => update({ location: event.currentTarget.value }) }
			/>
		</Stack>
	)
}
