import { Select } from "@mantine/core"
import { useMemo } from "react"

import { type DirectoryOrganizationalUnit } from "@/shared/directoryFixtures"

import { OrganizationalUnitSelectOption } from "./OrganizationalUnitSelectOption"
import { organizationalUnitSelectRows } from "./organizationalUnitSelectRows"

interface OrganizationalUnitSelectProps {
	value: string
	organizationalUnits: readonly DirectoryOrganizationalUnit[]
	disabled: boolean
	onChange: (path: string) => void
}

export function OrganizationalUnitSelect({
	value,
	organizationalUnits,
	disabled,
	onChange,
}: OrganizationalUnitSelectProps) {
	const rows = useMemo(
		() => organizationalUnitSelectRows(organizationalUnits),
		[organizationalUnits],
	)
	const rowsByPath = useMemo(
		() => new Map(rows.map((row) => [row.path, row])),
		[rows],
	)

	return (
		<Select
			label="Organizational unit"
			data={ rows.map((row) => ({ value: row.path, label: row.name })) }
			value={ value }
			disabled={ disabled }
			allowDeselect={ false }
			maxDropdownHeight={ 320 }
			renderOption={ ({ option, checked }) => {
				const row = rowsByPath.get(option.value)
				return (
					<OrganizationalUnitSelectOption
						name={ row?.name ?? option.label }
						depth={ row?.depth ?? 0 }
						hasChildren={ row?.hasChildren ?? false }
						isChecked={ checked === true }
					/>
				)
			} }
			onChange={ (path) => {
				if(!path) return
				onChange(path)
			} }
		/>
	)
}
