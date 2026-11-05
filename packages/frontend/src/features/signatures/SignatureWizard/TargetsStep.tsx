import { Alert, Collapse, Paper, Stack, Switch } from "@mantine/core"
import { UseFormReturnType } from "@mantine/form"
import { IconInfoCircle } from "@tabler/icons-react"
import clsx from "clsx"
import { ChangeEvent } from "react"

import { OrganizationalUnitTree } from "@/frontend/components/OrganizationalUnitTree"
import { TransferList } from "@/frontend/components/TransferList"
import { type DirectorySnapshot } from "@/frontend/queries/directory"

import { type ClaimedTargets } from "./claimedTargets"
import {
	toGroupSelectData,
	toOrganizationalUnitTreeData,
	toUserSelectData,
} from "./directoryOptions"
import * as classes from "./TargetsStep.css"
import { type SignatureAssignmentValues } from "./types"

interface TargetsStepProps {
	form: UseFormReturnType<SignatureAssignmentValues>
	directory: DirectorySnapshot
	claimedTargets: ClaimedTargets
}

function usedByReason(templateName: string) {
	return `Used by ${templateName}`
}

export function TargetsStep({ form, directory, claimedTargets }: TargetsStepProps) {
	const defaultInputProps = form.getInputProps("isDefault", { type: "checkbox" })
	const peopleInputProps = form.getInputProps("userEmails")
	const groupsInputProps = form.getInputProps("groupIds")
	const organizationalUnitInputProps = form.getInputProps("organizationalUnitPaths")

	function handlePeopleChange(nextValue: string[]) {
		form.setFieldValue("userEmails", nextValue)
	}

	function handleGroupsChange(nextValue: string[]) {
		form.setFieldValue("groupIds", nextValue)
	}

	function handleOrganizationalUnitsChange(nextValue: string[]) {
		form.setFieldValue("organizationalUnitPaths", nextValue)
	}
	const rivalDefault = claimedTargets.defaultTemplate
	const isDefaultDisabled = rivalDefault !== null
	const userSelectData = toUserSelectData(directory.users).map((option) => {
		const claim = claimedTargets.users.get(option.value)
		if(!claim) return option
		return {
			...option,
			disabled: true,
			disabledReason: usedByReason(claim.templateName),
		}
	})
	const groupSelectData = toGroupSelectData(directory.groups).map((option) => {
		const claim = claimedTargets.groups.get(option.value)
		if(!claim) return option
		return {
			...option,
			disabled: true,
			disabledReason: usedByReason(claim.templateName),
		}
	})
	const organizationalUnitTreeData = toOrganizationalUnitTreeData(directory.organizationalUnits)
	const disabledOrganizationalUnits = new Map(
		[...claimedTargets.organizationalUnits.entries()].map(([path, claim]) => [
			path,
			usedByReason(claim.templateName),
		]),
	)

	function handleDefaultChange(event: ChangeEvent<HTMLInputElement>) {
		if(isDefaultDisabled) return
		defaultInputProps.onChange(event)
		if(event.currentTarget.checked) {
			form.setFieldValue("userEmails", [])
			form.setFieldValue("groupIds", [])
			form.setFieldValue("organizationalUnitPaths", [])
			form.clearFieldError("userEmails")
		}
	}

	return (
		<Stack gap="md">
			<Paper
				p="md"
				className={ clsx(classes.section, classes.defaultCard) }
				data-checked={ form.values.isDefault }
			>
				<Switch
					label="Default signature"
					description={
						rivalDefault
							? `Already set on ${rivalDefault.templateName}. A person, group, or organizational unit still wins over the default.`
							: "Used when someone is not matched by a person, group, or organizational unit on any signature."
					}
					checked={ defaultInputProps.checked }
					disabled={ isDefaultDisabled }
					onChange={ handleDefaultChange }
				/>
			</Paper>

			<Collapse expanded={ form.values.isDefault } keepMounted={ false }>
				<Alert icon={ <IconInfoCircle size={ 16 } /> } color="blue">
					People, groups, and organizational units are off while this is the default. Turn default off to assign them.
				</Alert>
			</Collapse>

			<Collapse expanded={ !form.values.isDefault } keepMounted={ false }>
				<Stack gap="md">
					<Paper p="md" pt="sm" className={ clsx(classes.section) }>
						<TransferList
							label="People"
							data={ userSelectData }
							value={ peopleInputProps.value }
							onChange={ handlePeopleChange }
							error={ peopleInputProps.error }
							searchPlaceholder="Search people"
							nothingFoundMessage="No people found"
							choicesSearchLabel="Search people choices"
							chosenSearchLabel="Search chosen people"
						/>
					</Paper>
					<Paper p="md" pt="sm" className={ clsx(classes.section) }>
						<TransferList
							label="Groups"
							data={ groupSelectData }
							value={ groupsInputProps.value }
							onChange={ handleGroupsChange }
							error={ groupsInputProps.error }
							searchPlaceholder="Search groups"
							nothingFoundMessage="No groups found"
							choicesSearchLabel="Search group choices"
							chosenSearchLabel="Search chosen groups"
						/>
					</Paper>
					<Paper p="md" pt="sm" className={ clsx(classes.section) }>
						<OrganizationalUnitTree
							label="Organizational units"
							data={ organizationalUnitTreeData }
							value={ organizationalUnitInputProps.value }
							onChange={ handleOrganizationalUnitsChange }
							error={ organizationalUnitInputProps.error }
							searchPlaceholder="Search"
							nothingFoundMessage="No organizational units found"
							disabledPaths={ disabledOrganizationalUnits }
						/>
					</Paper>
				</Stack>
			</Collapse>
		</Stack>
	)
}
