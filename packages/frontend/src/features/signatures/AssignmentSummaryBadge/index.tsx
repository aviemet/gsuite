import { Badge, Group, Tooltip } from "@mantine/core"
import { IconBuilding, IconUser, IconUsers } from "@tabler/icons-react"

import {
	type AssignmentDetail,
	type AssignmentDetailKind,
	type TemplateAssignmentSummary,
} from "@/frontend/features/signatures/summarizeTemplateAssignments"

import * as classes from "./AssignmentSummaryBadge.css"

interface AssignmentSummaryBadgeProps {
	summary: TemplateAssignmentSummary
}

function detailColor(kind: AssignmentDetailKind) {
	if(kind === "group") return "teal"
	if(kind === "organizationalUnit") return "grape"
	return "blue"
}

function DetailIcon({ kind }: { kind: AssignmentDetailKind }) {
	if(kind === "group") return <IconUsers size={ 12 } />
	if(kind === "organizationalUnit") return <IconBuilding size={ 12 } />
	return <IconUser size={ 12 } />
}

function DetailBadges({ details }: { details: readonly AssignmentDetail[] }) {
	return (
		<Group gap={ 6 } maw={ 280 } style={ { flexWrap: "wrap" } }>
			{ details.map((detail) => (
				<Badge
					key={ `${ detail.kind }:${ detail.label }` }
					size="sm"
					variant="light"
					color={ detailColor(detail.kind) }
					leftSection={ <DetailIcon kind={ detail.kind } /> }
				>
					{ detail.label }
				</Badge>
			)) }
		</Group>
	)
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
