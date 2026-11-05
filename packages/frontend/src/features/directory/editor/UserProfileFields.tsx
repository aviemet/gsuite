import { Stack, TextInput } from "@mantine/core"

import { type DirectoryOrganizationalUnit } from "@/shared/directoryFixtures"
import { type DirectoryUserUpdate } from "@/shared/directoryUpdate"

import { OrganizationalUnitSelect } from "./OrganizationalUnitSelect"

interface UserProfileFieldsProps {
	value: DirectoryUserUpdate
	organizationalUnits: readonly DirectoryOrganizationalUnit[]
	disabled: boolean
	onChange: (value: DirectoryUserUpdate) => void
}

export function UserProfileFields({
	value,
	organizationalUnits,
	disabled,
	onChange,
}: UserProfileFieldsProps) {
	return (
		<Stack gap="sm">
			<TextInput
				label="Given name"
				value={ value.givenName }
				disabled={ disabled }
				onChange={ (event) => onChange({ ...value, givenName: event.currentTarget.value }) }
			/>
			<TextInput
				label="Family name"
				value={ value.familyName }
				disabled={ disabled }
				onChange={ (event) => onChange({ ...value, familyName: event.currentTarget.value }) }
			/>
			<OrganizationalUnitSelect
				value={ value.organizationalUnitPath }
				organizationalUnits={ organizationalUnits }
				disabled={ disabled }
				onChange={ (organizationalUnitPath) => onChange({ ...value, organizationalUnitPath }) }
			/>
		</Stack>
	)
}
