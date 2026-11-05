import { TextInput } from "@mantine/core"
import { type ChangeEvent } from "react"

interface CompanyNameFieldProps {
	name: string
	disabled: boolean
	onChange: (name: string) => void
}

export function CompanyNameField({ name, disabled, onChange }: CompanyNameFieldProps) {
	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event.currentTarget.value)
	}

	return (
		<TextInput
			label="Company name"
			value={ name }
			disabled={ disabled }
			onChange={ handleChange }
		/>
	)
}
