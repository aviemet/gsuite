import { Badge, Box, Button, Card, Group, Text } from "@mantine/core"
import { IconCalendarEvent, IconPencil } from "@tabler/icons-react"
import { Link, useRouter } from "@tanstack/react-router"
import clsx from "clsx"

import { HtmlPreview } from "@/frontend/components/HtmlPreview"
import { AssignmentSummaryBadge } from "@/frontend/features/signatures/AssignmentSummaryBadge"
import { type TemplateAssignmentSummary } from "@/frontend/features/signatures/summarizeTemplateAssignments"
import { Template } from "@/frontend/types/firebase"
import { safeTemplateParse } from "@/shared/parseTemplate"
import { samplePerson } from "@/shared/person.testdata"
import { getTemplatePreviewContext } from "@/shared/templatePlaceholders"

import * as classes from "./SignatureCard.css"

interface SignatureCardProps {
	template: Template
	assignmentSummary: TemplateAssignmentSummary
}

const previewContext = getTemplatePreviewContext(samplePerson)

export function SignatureCard({ template, assignmentSummary }: SignatureCardProps) {
	const router = useRouter()
	const isScheduled = template.isScheduled === true
	const previewHtml = safeTemplateParse(template.content, previewContext)

	return (
		<Card
			withBorder
			radius="md"
			padding="lg"
			className={ clsx(classes.cardRoot) }
		>
			<Group justify="space-between" align="flex-start" mb="sm">
				<Link
					to="/signatures/edit/$id"
					params={ { id: template.id } }
					style={ { textDecoration: "none", color: "inherit" } }
				>
					<Text fw={ 700 } size="lg">
						{ template.name }
					</Text>
				</Link>
				<Button
					variant="subtle"
					size="xs"
					className={ clsx(classes.editButton) }
					aria-label={ `Edit ${ template.name }` }
					onClick={ () => router.navigate({ to: "/signatures/edit/$id", params: { id: template.id } }) }
				>
					<IconPencil size={ 16 } aria-hidden />
				</Button>
			</Group>
			<Group gap="xs" mb="md">
				<AssignmentSummaryBadge summary={ assignmentSummary } />
				<Badge
					size="sm"
					variant="light"
					color={ isScheduled ? "violet" : "gray" }
					leftSection={ <IconCalendarEvent size={ 12 } /> }
				>
					{ isScheduled ? "Scheduled" : "Not scheduled" }
				</Badge>
			</Group>
			<Box className={ classes.previewFrame }>
				<Box className={ classes.previewContent }>
					<HtmlPreview html={ previewHtml } />
				</Box>
			</Box>
		</Card>
	)
}
