import { Button, Divider, Group, Stack, Textarea, TextInput } from "@mantine/core"
import { type ChangeEvent } from "react"

import { type CompanyAddress } from "@/shared/company"

import { CompanyRemoveButton } from "./CompanyRemoveButton"
import { CompanySection } from "./CompanySection"

interface CompanyAddressListProps {
	addresses: CompanyAddress[]
	disabled: boolean
	onChange: (addresses: CompanyAddress[]) => void
}

interface AddressRowProps {
	address: CompanyAddress
	disabled: boolean
	showDivider: boolean
	onAddressChange: (addressId: string, address: CompanyAddress) => void
	onRemove: (addressId: string) => void
}

function AddressRow({
	address,
	disabled,
	showDivider,
	onAddressChange,
	onRemove,
}: AddressRowProps) {
	function handleLabelChange(event: ChangeEvent<HTMLInputElement>) {
		onAddressChange(address.id, { ...address, label: event.currentTarget.value })
	}

	function handleFormattedChange(event: ChangeEvent<HTMLTextAreaElement>) {
		onAddressChange(address.id, { ...address, formatted: event.currentTarget.value })
	}

	function handleRemove() {
		onRemove(address.id)
	}

	const removeLabel = address.label.trim()
		? `Remove ${ address.label.trim() }`
		: "Remove address"

	return (
		<Stack gap="xs">
			{ showDivider ? <Divider /> : null }
			<Group align="center" wrap="nowrap" gap="xs">
				<TextInput
					aria-label="Address label"
					placeholder="Label"
					value={ address.label }
					disabled={ disabled }
					flex={ 1 }
					onChange={ handleLabelChange }
				/>
				<CompanyRemoveButton
					label={ removeLabel }
					disabled={ disabled }
					onClick={ handleRemove }
				/>
			</Group>
			<Textarea
				aria-label="Address"
				placeholder="Address"
				value={ address.formatted }
				disabled={ disabled }
				minRows={ 2 }
				onChange={ handleFormattedChange }
			/>
		</Stack>
	)
}

export function CompanyAddressList({ addresses, disabled, onChange }: CompanyAddressListProps) {
	function handleAddressChange(addressId: string, address: CompanyAddress) {
		onChange(addresses.map((current) => current.id === addressId ? address : current))
	}

	function handleRemove(addressId: string) {
		onChange(addresses.filter((address) => address.id !== addressId))
	}

	function handleAdd() {
		onChange([...addresses, { id: crypto.randomUUID(), label: "", formatted: "" }])
	}

	const firstAddressId = addresses[0]?.id

	return (
		<CompanySection title="Addresses">
			{ addresses.map((address) => (
				<AddressRow
					key={ address.id }
					address={ address }
					disabled={ disabled }
					showDivider={ address.id !== firstAddressId }
					onAddressChange={ handleAddressChange }
					onRemove={ handleRemove }
				/>
			)) }
			<Button variant="default" w="fit-content" disabled={ disabled } onClick={ handleAdd }>
				Add address
			</Button>
		</CompanySection>
	)
}
