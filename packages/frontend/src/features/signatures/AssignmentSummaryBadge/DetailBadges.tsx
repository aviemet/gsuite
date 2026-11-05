import { Badge, Group } from "@mantine/core"

import {
	type AssignmentDetail,
	type AssignmentDetailKind,
} from "@/frontend/features/signatures/summarizeTemplateAssignments"

import { DetailIcon } from "./DetailIcon"

interface DetailBadgesProps {
	details: readonly AssignmentDetail[]
}

function detailColor(kind: AssignmentDetailKind) {
	if(kind === "group") return "teal"
	if(kind === "organizationalUnit") return "grape"
	return "blue"
}

export function DetailBadges({ details }: DetailBadgesProps) {
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
