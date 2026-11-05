import { ActionIcon, Badge, Box, Card, Group, Text, Tooltip } from "@mantine/core"
import { IconCalendarEvent, IconPencil, IconUsers } from "@tabler/icons-react"
import { Link, useRouter } from "@tanstack/react-router"
import clsx from "clsx"

import { HtmlPreview } from "@/frontend/components/HtmlPreview"
import { AssignmentSummaryBadge } from "@/frontend/features/signatures/AssignmentSummaryBadge"
import { DeploySignatureAction } from "@/frontend/features/signatures/DeploySignatureAction"
import { type TemplateAssignmentSummary } from "@/frontend/features/signatures/summarizeTemplateAssignments"
import { Template } from "@/frontend/types/firebase"
import { safeTemplateParse } from "@/shared/parseTemplate"
import { buildPreviewTemplateContext } from "@/shared/templatePlaceholders"

import * as classes from "./SignatureCard.css"

interface SignatureCardProps {
	template: Template
	assignmentSummary: TemplateAssignmentSummary
}

const previewContext = buildPreviewTemplateContext()

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
					to="/admin/signatures/edit/$id"
					params={ { id: template.id } }
					style={ { textDecoration: "none", color: "inherit" } }
				>
					<Text fw={ 700 } size="lg">
						{ template.name }
					</Text>
				</Link>
				<Group gap={ 4 } wrap="nowrap">
					<DeploySignatureAction
						templateId={ template.id }
						templateName={ template.name }
					/>
					<Tooltip label="Assignment" withArrow position="top">
						<ActionIcon
							variant="subtle"
							color="harbor"
							size="sm"
							aria-label={ `Assignment for ${ template.name }` }
							onClick={ () => router.navigate({
								to: "/admin/signatures/$id/assignment",
								params: { id: template.id },
							}) }
						>
							<IconUsers size={ 16 } aria-hidden />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Edit" withArrow position="top">
						<ActionIcon
							variant="subtle"
							color="harbor"
							size="sm"
							className={ clsx(classes.editButton) }
							aria-label={ `Edit ${ template.name }` }
							onClick={ () => router.navigate({ to: "/admin/signatures/edit/$id", params: { id: template.id } }) }
						>
							<IconPencil size={ 16 } aria-hidden />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Group>
			<Group gap="xs" mb="md">
				<Link
					to="/admin/signatures/$id/assignment"
					params={ { id: template.id } }
					style={ { textDecoration: "none" } }
				>
					<AssignmentSummaryBadge summary={ assignmentSummary } />
				</Link>
				<Link
					to="/admin/signatures/$id/assignment"
					params={ { id: template.id } }
					style={ { textDecoration: "none" } }
				>
					<Badge
						size="sm"
						variant="light"
						color={ isScheduled ? "violet" : "gray" }
						leftSection={ <IconCalendarEvent size={ 12 } /> }
					>
						{ isScheduled ? "Scheduled" : "Not scheduled" }
					</Badge>
				</Link>
			</Group>
			<Box className={ classes.previewFrame }>
				<Box className={ classes.previewContent }>
					<HtmlPreview html={ previewHtml } />
				</Box>
			</Box>
		</Card>
	)
}
