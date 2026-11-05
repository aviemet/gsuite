import { Button, Group, Stack, Text } from "@mantine/core"
import { useState } from "react"

import {
	type CompanyAddress,
	type CompanyDepartment,
	type CompanyPhone,
	type CompanyProfile,
	normalizeCompanyProfile,
} from "@/shared/company"

import { CompanyAddressList } from "./CompanyAddressList"
import { CompanyDepartmentList } from "./CompanyDepartmentList"
import { CompanyNameField } from "./CompanyNameField"
import { CompanyPhoneList } from "./CompanyPhoneList"
import { CompanySection } from "./CompanySection"

interface CompanyFormProps {
	profile: CompanyProfile
	canSave: boolean
	isSaving: boolean
	onSave: (profile: CompanyProfile) => void
}

export function CompanyForm({ profile, canSave, isSaving, onSave }: CompanyFormProps) {
	const [draft, setDraft] = useState(profile)
	const [errorMessage, setErrorMessage] = useState("")
	const fieldsDisabled = !canSave || isSaving

	function handleNameChange(name: string) {
		setDraft({ ...draft, name })
	}

	function handleDepartmentsChange(departments: CompanyDepartment[]) {
		setDraft({ ...draft, departments })
	}

	function handlePhonesChange(phones: CompanyPhone[]) {
		setDraft({ ...draft, phones })
	}

	function handleAddressesChange(addresses: CompanyAddress[]) {
		setDraft({ ...draft, addresses })
	}

	function handleSave() {
		try {
			setErrorMessage("")
			onSave(normalizeCompanyProfile(draft))
		} catch (error) {
			const message = error instanceof Error ? error.message : "Could not save company"
			setErrorMessage(message)
		}
	}

	return (
		<Stack gap="xl">
			<CompanySection>
				<CompanyNameField
					name={ draft.name }
					disabled={ fieldsDisabled }
					onChange={ handleNameChange }
				/>
			</CompanySection>
			<CompanyDepartmentList
				departments={ draft.departments }
				disabled={ fieldsDisabled }
				onChange={ handleDepartmentsChange }
			/>
			<CompanyPhoneList
				phones={ draft.phones }
				disabled={ fieldsDisabled }
				onChange={ handlePhonesChange }
			/>
			<CompanyAddressList
				addresses={ draft.addresses }
				disabled={ fieldsDisabled }
				onChange={ handleAddressesChange }
			/>
			{ errorMessage
				? <Text c="red" role="alert">{ errorMessage }</Text>
				: null }
			{ canSave
				? (
					<Group justify="flex-end">
						<Button loading={ isSaving } onClick={ handleSave }>
							Save
						</Button>
					</Group>
				)
				: null }
		</Stack>
	)
}
