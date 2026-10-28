import { Alert, Collapse, Paper, SimpleGrid, Stack, Switch, Text } from "@mantine/core"
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
import { type SignatureWizardValues } from "./types"

interface TargetsStepProps {
	form: UseFormReturnType<SignatureWizardValues>
	directory: DirectorySnapshot
	claimedTargets: ClaimedTargets
}

function usedByReason(templateName: string) {
	return `Used by ${templateName}`
}

export function TargetsStep({ form, directory, claimedTargets }: TargetsStepProps) {
	const defaultInputProps = form.getInputProps("isDefault", { type: "checkbox" })
	const scheduledInputProps = form.getInputProps("isScheduled", { type: "checkbox" })
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
		<Stack gap="lg" mt="md">
			<SimpleGrid cols={ { base: 1, md: 2 } } spacing="lg">
				<Paper
					p="md"
					className={ clsx(classes.section, classes.defaultCard) }
					data-checked={ form.values.isDefault }
				>
					<Switch
						label="Default signature"
						description={
							rivalDefault
								? `Already set on ${rivalDefault.templateName}. Person, group, and OU targets still override by specificity.`
								: "Applied to any user who is not matched by a more specific person, group, or OU assignment."
						}
						checked={ defaultInputProps.checked }
						disabled={ isDefaultDisabled }
						onChange={ handleDefaultChange }
					/>
				</Paper>
				<Paper p="md" className={ clsx(classes.section) }>
					<Switch
						label="Apply every 24 hours"
						description="Re-apply this signature to matched accounts once a day. If off, it is applied only when you save."
						checked={ scheduledInputProps.checked }
						onChange={ scheduledInputProps.onChange }
					/>
				</Paper>
			</SimpleGrid>

			<Paper p="md" className={ clsx(classes.section, classes.rulesCard) }>
				<Stack gap={ 6 }>
					<Text size="sm" className={ clsx(classes.rulesTitle) }>
						How signatures are chosen
					</Text>
					<Text size="sm">
						A person, group, or organizational unit can only be assigned to one signature at a time. Choices already used by another signature are grayed out. If someone matches more than one assignment, the most specific one wins: a person beats a group, a group beats an organizational unit, and anything beats the default.
					</Text>
				</Stack>
			</Paper>

			<Collapse expanded={ form.values.isDefault } keepMounted={ false }>
				<Alert icon={ <IconInfoCircle size={ 16 } /> } color="blue">
					Other targeting choices are hidden while this is the default. Turn default off to assign specific people, groups, or OUs instead.
				</Alert>
			</Collapse>

			<Collapse expanded={ !form.values.isDefault } keepMounted={ false }>
				<Stack gap="md">
					<Paper p="md" pt="sm" className={ clsx(classes.section, classes.halfWidthSection) }>
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
				</Stack>
			</Collapse>
		</Stack>
	)
}
