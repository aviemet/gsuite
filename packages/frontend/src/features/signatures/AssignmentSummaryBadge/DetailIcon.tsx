import { IconBuilding, IconUser, IconUsers } from "@tabler/icons-react"

import { type AssignmentDetailKind } from "@/frontend/features/signatures/summarizeTemplateAssignments"

interface DetailIconProps {
	kind: AssignmentDetailKind
}

export function DetailIcon({ kind }: DetailIconProps) {
	if(kind === "group") return <IconUsers size={ 12 } />
	if(kind === "organizationalUnit") return <IconBuilding size={ 12 } />
	return <IconUser size={ 12 } />
}
