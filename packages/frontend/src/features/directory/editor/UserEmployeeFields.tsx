import { Autocomplete, Stack, TextInput } from "@mantine/core"
import { type ChangeEvent } from "react"

import { type DirectoryUserUpdate } from "@/shared/directoryUpdate"

interface UserEmployeeFieldsProps {
	value: DirectoryUserUpdate
	departments: readonly string[] | undefined
	disabled: boolean
	onChange: (value: DirectoryUserUpdate) => void
}

export function UserEmployeeFields({
	value,
	departments,
	disabled,
	onChange,
}: UserEmployeeFieldsProps) {
	function update(patch: Partial<DirectoryUserUpdate>) {
		onChange({ ...value, ...patch })
	}

	function handleJobTitleChange(event: ChangeEvent<HTMLInputElement>) {
		update({ jobTitle: event.currentTarget.value })
	}

	function handleDepartmentChange(department: string) {
		update({ department })
	}

	function handleOrganizationChange(event: ChangeEvent<HTMLInputElement>) {
		update({ organization: event.currentTarget.value })
	}

	function handleManagerEmailChange(event: ChangeEvent<HTMLInputElement>) {
		update({ managerEmail: event.currentTarget.value })
	}

	function handleEmployeeIdChange(event: ChangeEvent<HTMLInputElement>) {
		update({ employeeId: event.currentTarget.value })
	}

	function handleCostCenterChange(event: ChangeEvent<HTMLInputElement>) {
		update({ costCenter: event.currentTarget.value })
	}

	function handleLocationChange(event: ChangeEvent<HTMLInputElement>) {
		update({ location: event.currentTarget.value })
	}

	return (
		<Stack gap="sm">
			<TextInput
				label="Job title"
				value={ value.jobTitle }
				disabled={ disabled }
				onChange={ handleJobTitleChange }
			/>
			<Autocomplete
				label="Department"
				description="Suggestions come from the Company page."
				data={ [...(departments ?? [])] }
				value={ value.department }
				disabled={ disabled }
				onChange={ handleDepartmentChange }
			/>
			<TextInput
				label="Organization"
				value={ value.organization }
				disabled={ disabled }
				onChange={ handleOrganizationChange }
			/>
			<TextInput
				label="Manager email"
				value={ value.managerEmail }
				disabled={ disabled }
				onChange={ handleManagerEmailChange }
			/>
			<TextInput
				label="Employee ID"
				value={ value.employeeId }
				disabled={ disabled }
				onChange={ handleEmployeeIdChange }
			/>
			<TextInput
				label="Cost center"
				value={ value.costCenter }
				disabled={ disabled }
				onChange={ handleCostCenterChange }
			/>
			<TextInput
				label="Location"
				value={ value.location }
				disabled={ disabled }
				onChange={ handleLocationChange }
			/>
		</Stack>
	)
}
