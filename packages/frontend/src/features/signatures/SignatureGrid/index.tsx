import { SimpleGrid } from "@mantine/core"

import { SignatureCard } from "@/frontend/features/signatures/SignatureCard"
import { type TemplateAssignmentSummary } from "@/frontend/features/signatures/summarizeTemplateAssignments"
import { Template } from "@/frontend/types/firebase"

interface SignatureGridProps {
	templates: Template[]
	assignmentSummaries: ReadonlyMap<string, TemplateAssignmentSummary>
	loading: boolean
}

const unassignedSummary: TemplateAssignmentSummary = {
	text: "Unassigned",
	details: [],
	hasDetailTooltip: false,
}

export function SignatureGrid({ templates, assignmentSummaries }: SignatureGridProps) {
	return (
		<SimpleGrid
			cols={ { base: 1, md: 2 } }
			spacing="lg"
		>
			{ templates.map((template) => (
				<SignatureCard
					key={ template.id }
					template={ template }
					assignmentSummary={ assignmentSummaries.get(template.id) ?? unassignedSummary }
				/>
			)) }
		</SimpleGrid>
	)
}
