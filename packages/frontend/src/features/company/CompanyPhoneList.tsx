import { Button, Group, Stack, TextInput } from "@mantine/core"
import { type ChangeEvent } from "react"

import { type CompanyPhone } from "@/shared/company"

import { CompanyRemoveButton } from "./CompanyRemoveButton"
import { CompanySection } from "./CompanySection"

interface CompanyPhoneListProps {
	phones: CompanyPhone[]
	disabled: boolean
	onChange: (phones: CompanyPhone[]) => void
}

interface PhoneRowProps {
	phone: CompanyPhone
	disabled: boolean
	onPhoneChange: (phoneId: string, phone: CompanyPhone) => void
	onRemove: (phoneId: string) => void
}

function PhoneRow({ phone, disabled, onPhoneChange, onRemove }: PhoneRowProps) {
	function handleLabelChange(event: ChangeEvent<HTMLInputElement>) {
		onPhoneChange(phone.id, { ...phone, label: event.currentTarget.value })
	}

	function handleNumberChange(event: ChangeEvent<HTMLInputElement>) {
		onPhoneChange(phone.id, { ...phone, number: event.currentTarget.value })
	}

	function handleRemove() {
		onRemove(phone.id)
	}

	const removeLabel = phone.label.trim()
		? `Remove ${ phone.label.trim() }`
		: "Remove phone"

	return (
		<Group align="center" wrap="nowrap" gap="xs">
			<TextInput
				aria-label="Phone label"
				placeholder="Label"
				value={ phone.label }
				disabled={ disabled }
				flex={ 1 }
				onChange={ handleLabelChange }
			/>
			<TextInput
				aria-label="Phone number"
				placeholder="Number"
				value={ phone.number }
				disabled={ disabled }
				flex={ 1 }
				onChange={ handleNumberChange }
			/>
			<CompanyRemoveButton
				label={ removeLabel }
				disabled={ disabled }
				onClick={ handleRemove }
			/>
		</Group>
	)
}

export function CompanyPhoneList({ phones, disabled, onChange }: CompanyPhoneListProps) {
	function handlePhoneChange(phoneId: string, phone: CompanyPhone) {
		onChange(phones.map((current) => current.id === phoneId ? phone : current))
	}

	function handleRemove(phoneId: string) {
		onChange(phones.filter((phone) => phone.id !== phoneId))
	}

	function handleAdd() {
		onChange([...phones, { id: crypto.randomUUID(), label: "", number: "" }])
	}

	return (
		<CompanySection title="Phone numbers">
			{ phones.length > 0
				? (
					<Stack gap="xs">
						{ phones.map((phone) => (
							<PhoneRow
								key={ phone.id }
								phone={ phone }
								disabled={ disabled }
								onPhoneChange={ handlePhoneChange }
								onRemove={ handleRemove }
							/>
						)) }
					</Stack>
				)
				: null }
			<Button variant="default" w="fit-content" disabled={ disabled } onClick={ handleAdd }>
				Add phone
			</Button>
		</CompanySection>
	)
}
