import { Alert, Collapse, MultiSelect, Paper, Stack, Switch, Text } from "@mantine/core"
import { UseFormReturnType } from "@mantine/form"
import { IconInfoCircle } from "@tabler/icons-react"
import clsx from "clsx"
import { ChangeEvent } from "react"

import {
	directoryGroupSelectData,
	directoryOrganizationalUnitSelectData,
	directoryUserSelectData,
} from "./directoryTestdata"
import * as classes from "./TargetsStep.css"
import { type SignatureWizardValues } from "./types"

interface TargetsStepProps {
	form: UseFormReturnType<SignatureWizardValues>
}

export function TargetsStep({ form }: TargetsStepProps) {
	const defaultInputProps = form.getInputProps("isDefault", { type: "checkbox" })
	const scheduledInputProps = form.getInputProps("isScheduled", { type: "checkbox" })

	function handleDefaultChange(event: ChangeEvent<HTMLInputElement>) {
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
			<Paper
				p="md"
				withBorder
				className={ clsx(classes.defaultCard) }
				data-checked={ form.values.isDefault }
			>
				<Switch
					label="Default signature"
					description="Applied to any user who is not matched by another signature's people, groups, or OUs."
					checked={ defaultInputProps.checked }
					onChange={ handleDefaultChange }
				/>
			</Paper>

			<Collapse expanded={ form.values.isDefault } keepMounted={ false }>
				<Alert icon={ <IconInfoCircle size={ 16 } /> } color="blue">
					Other targeting choices are hidden while this is the default. Turn default off to assign specific people, groups, or OUs instead.
				</Alert>
			</Collapse>

			<Collapse expanded={ !form.values.isDefault } keepMounted={ false }>
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						Choose any mix of people, groups, and organizational units. At least one target is required unless this is the default signature.
					</Text>
					<MultiSelect
						label="People"
						placeholder="Choose individuals"
						data={ directoryUserSelectData }
						searchable
						clearable
						hidePickedOptions
						nothingFoundMessage="No people found"
						{ ...form.getInputProps("userEmails") }
					/>
					<MultiSelect
						label="Groups"
						placeholder="Choose one or more groups"
						data={ directoryGroupSelectData }
						searchable
						clearable
						hidePickedOptions
						nothingFoundMessage="No groups found"
						{ ...form.getInputProps("groupIds") }
					/>
					<MultiSelect
						label="Organizational units"
						placeholder="Choose one or more OUs"
						data={ directoryOrganizationalUnitSelectData }
						searchable
						clearable
						hidePickedOptions
						nothingFoundMessage="No OUs found"
						{ ...form.getInputProps("organizationalUnitPaths") }
					/>
				</Stack>
			</Collapse>

			<Paper p="md" withBorder>
				<Switch
					label="Apply every 24 hours"
					description="Re-apply this signature to matched accounts once a day. If off, it is applied only when you save."
					checked={ scheduledInputProps.checked }
					onChange={ scheduledInputProps.onChange }
				/>
			</Paper>
		</Stack>
	)
}
