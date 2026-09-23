import { samplePerson } from "@/shared/person.testdata"
import { getTemplatePreviewContext } from "@/shared/templatePlaceholders"
import { Badge, Grid, Group, Paper, Stack, Text } from "@mantine/core"
import { ReactNode } from "react"

import { HtmlPreview } from "@/frontend/components/HtmlPreview"
import { safeTemplateParse } from "@/frontend/lib/parseTemplate"
import { Template } from "@/frontend/types/firebase"

import {
	findDirectoryGroup,
	findDirectoryOrganizationalUnit,
	findDirectoryUser,
} from "./directoryTestdata"
import { findStartTemplate } from "./startTemplates"
import { SETUP_SOURCE_LABELS, type SignatureWizardValues } from "./types"

interface ConfirmStepProps {
	values: SignatureWizardValues
	templates: Template[]
}

const previewContext = getTemplatePreviewContext(samplePerson)

function SummaryRow({ label, children }: { label: string, children: ReactNode }) {
	return (
		<Stack gap={ 4 }>
			<Text size="sm" c="dimmed">{ label }</Text>
			{ children }
		</Stack>
	)
}

export function ConfirmStep({ values, templates }: ConfirmStepProps) {
	const previewHtml = safeTemplateParse(values.content, previewContext)
	const selectedTemplate = values.sourceTemplateId
		? findStartTemplate(values.sourceTemplateId, templates)
		: undefined
	const selectedAccount = values.sourceAccountEmail
		? findDirectoryUser(values.sourceAccountEmail)
		: undefined
	const setupDetail = values.setupSource === "template"
		? selectedTemplate?.name ?? "No template selected"
		: values.setupSource === "account"
			? selectedAccount
				? `${selectedAccount.displayName} (${selectedAccount.email})`
				: "No account selected"
			: null
	const peopleLabels = values.userEmails.map((email) => {
		const user = findDirectoryUser(email)
		return user ? `${user.displayName} (${user.email})` : email
	})
	const groupLabels = values.groupIds.map((groupId) => findDirectoryGroup(groupId)?.name ?? groupId)
	const organizationalUnitLabels = values.organizationalUnitPaths.map((path) => {
		const unit = findDirectoryOrganizationalUnit(path)
		if(!unit) return path
		return unit.path === "/" ? unit.name : unit.path
	})

	return (
		<Grid mt="md">
			<Grid.Col span={ { base: 12, md: 6 } }>
				<Stack gap="lg">
					<SummaryRow label="Setup">
						<Text>
							{ values.setupSource ? SETUP_SOURCE_LABELS[values.setupSource] : "Not chosen" }
							{ setupDetail ? ` — ${setupDetail}` : "" }
						</Text>
					</SummaryRow>

					<SummaryRow label="Name">
						<Text>{ values.name || "Untitled" }</Text>
					</SummaryRow>

					<SummaryRow label="Targets">
						{ values.isDefault
							? (
								<Badge variant="light" color="blue">
									Default — anyone not otherwise matched
								</Badge>
							)
							: (
								<Stack gap="xs">
									{ peopleLabels.length > 0 && (
										<Group gap="xs">
											{ peopleLabels.map((label) => (
												<Badge key={ label } variant="light">{ label }</Badge>
											)) }
										</Group>
									) }
									{ groupLabels.length > 0 && (
										<Group gap="xs">
											{ groupLabels.map((label) => (
												<Badge key={ label } variant="light" color="teal">{ label }</Badge>
											)) }
										</Group>
									) }
									{ organizationalUnitLabels.length > 0 && (
										<Group gap="xs">
											{ organizationalUnitLabels.map((label) => (
												<Badge key={ label } variant="light" color="grape">{ label }</Badge>
											)) }
										</Group>
									) }
									{ peopleLabels.length === 0 && groupLabels.length === 0 && organizationalUnitLabels.length === 0 && (
										<Text c="dimmed">No targets selected</Text>
									) }
								</Stack>
							) }
					</SummaryRow>

					<SummaryRow label="Schedule">
						<Text>
							{ values.isScheduled
								? "Applies every 24 hours"
								: "Applies only when saved" }
						</Text>
					</SummaryRow>
				</Stack>
			</Grid.Col>

			<Grid.Col span={ { base: 12, md: 6 } }>
				<Stack gap="xs">
					<Text size="sm" c="dimmed">Signature preview</Text>
					<Paper p="md" withBorder bg="white" c="black" mih="16rem">
						<HtmlPreview html={ previewHtml } />
					</Paper>
				</Stack>
			</Grid.Col>
		</Grid>
	)
}
