import { Button, Group, Select, Stack, TextInput } from "@mantine/core"

import { type DirectoryPhoneNumber } from "@/shared/directoryFixtures"
import { type DirectoryUserUpdate } from "@/shared/directoryUpdate"

interface UserContactFieldsProps {
	value: DirectoryUserUpdate
	disabled: boolean
	onChange: (value: DirectoryUserUpdate) => void
}

const phoneTypes: Array<{ value: DirectoryPhoneNumber["type"], label: string }> = [
	{ value: "work", label: "Work" },
	{ value: "mobile", label: "Mobile" },
	{ value: "home", label: "Home" },
]

export function UserContactFields({ value, disabled, onChange }: UserContactFieldsProps) {
	function updatePhone(index: number, phone: DirectoryPhoneNumber) {
		onChange({
			...value,
			phoneNumbers: value.phoneNumbers.map((current, phoneIndex) => (
				phoneIndex === index ? phone : current
			)),
		})
	}

	return (
		<Stack gap="sm">
			<TextInput
				label="Address"
				value={ value.address }
				disabled={ disabled }
				onChange={ (event) => onChange({ ...value, address: event.currentTarget.value }) }
			/>
			{ value.phoneNumbers.map((phone, index) => (
				<Group key={ `${ phone.type }-${ index }` } align="flex-end" grow>
					<Select
						label="Phone type"
						data={ phoneTypes }
						value={ phone.type }
						disabled={ disabled }
						allowDeselect={ false }
						onChange={ (type) => {
							if(type !== "work" && type !== "mobile" && type !== "home") return
							updatePhone(index, { ...phone, type })
						} }
					/>
					<TextInput
						label="Phone number"
						value={ phone.number }
						disabled={ disabled }
						onChange={ (event) => updatePhone(index, { ...phone, number: event.currentTarget.value }) }
					/>
					<Button
						variant="default"
						disabled={ disabled }
						onClick={ () => onChange({
							...value,
							phoneNumbers: value.phoneNumbers.filter((_, phoneIndex) => phoneIndex !== index),
						}) }
					>
						Remove
					</Button>
				</Group>
			)) }
			<Button
				variant="default"
				disabled={ disabled }
				onClick={ () => onChange({
					...value,
					phoneNumbers: [...value.phoneNumbers, { type: "work", number: "" }],
				}) }
			>
				Add phone
			</Button>
		</Stack>
	)
}
