import { Badge, Tooltip } from "@mantine/core"
import { IconUsers } from "@tabler/icons-react"

import { type TemplateAssignmentSummary } from "@/frontend/features/signatures/summarizeTemplateAssignments"

import * as classes from "./AssignmentSummaryBadge.css"
import { DetailBadges } from "./DetailBadges"

interface AssignmentSummaryBadgeProps {
	summary: TemplateAssignmentSummary
}

export function AssignmentSummaryBadge({ summary }: AssignmentSummaryBadgeProps) {
	const isUnassigned = summary.text === "Unassigned"
	const badge = (
		<Badge
			size="sm"
			variant="light"
			color={ isUnassigned ? "gray" : "blue" }
			leftSection={ <IconUsers size={ 12 } /> }
		>
			{ summary.text }
		</Badge>
	)

	if(!summary.hasDetailTooltip || summary.details.length === 0) return badge

	return (
		<Tooltip
			label={ <DetailBadges details={ summary.details } /> }
			radius="md"
			withArrow
			multiline
			maw={ 320 }
			classNames={ { tooltip: classes.tooltip } }
			events={ { hover: true, focus: true, touch: true } }
		>
			<span style={ { display: "inline-flex" } }>{ badge }</span>
		</Tooltip>
	)
}
