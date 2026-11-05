import { Stack, TextInput } from "@mantine/core"

import { type DirectoryGroupUpdate } from "@/shared/directoryUpdate"

interface GroupDetailsFieldsProps {
	value: DirectoryGroupUpdate
	disabled: boolean
	onChange: (value: DirectoryGroupUpdate) => void
}

export function GroupDetailsFields({ value, disabled, onChange }: GroupDetailsFieldsProps) {
	return (
		<Stack gap="sm">
			<TextInput
				label="Name"
				value={ value.name }
				disabled={ disabled }
				onChange={ (event) => onChange({ ...value, name: event.currentTarget.value }) }
			/>
			<TextInput
				label="Email"
				value={ value.email }
				disabled={ disabled }
				onChange={ (event) => onChange({ ...value, email: event.currentTarget.value }) }
			/>
			<TextInput
				label="Description"
				value={ value.description }
				disabled={ disabled }
				onChange={ (event) => onChange({ ...value, description: event.currentTarget.value }) }
			/>
		</Stack>
	)
}
