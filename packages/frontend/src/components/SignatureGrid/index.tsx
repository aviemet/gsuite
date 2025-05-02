import { SimpleGrid } from "@mantine/core"

import { SignatureCard } from "@/frontend/components/SignatureCard"
import { Template } from "@/frontend/types/firebase"

interface SignatureGridProps {
	templates: Template[]
	loading: boolean
}

export const SignatureGrid = ({ templates, loading }: SignatureGridProps) => {
	return (
		<SimpleGrid
			cols={ { base: 1, sm: 2, lg: 3 } }
			spacing="lg"
		>
			{ templates.map((template) => (
				<SignatureCard
					key={ template.id }
					template={ template }
				/>
			)) }
		</SimpleGrid>
	)
}
