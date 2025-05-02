import { Badge, Card, Group, Stack, Text } from "@mantine/core"
import { Link } from "@tanstack/react-router"

import { Template } from "@/frontend/types/firebase"

interface SignatureCardProps {
	template: Template
}

export const SignatureCard = ({ template }: SignatureCardProps) => {
	return (
		<Card
			component={ Link }
			to="/signatures/$signatureId"
			params={ { signatureId: template.id } }
			withBorder
			radius="md"
			padding="lg"
			style={ { textDecoration: "none" } }
		>
			<Stack gap="md">
				<Text fw={ 700 } size="lg">
					{ template.name }
				</Text>

				<Stack gap="xs">
					<Text size="sm" fw={ 500 }>Variables</Text>
					<Group gap="xs">
						{ template.variables.map((variable) => (
							<Badge key={ variable } size="sm" variant="light">
								{ variable }
							</Badge>
						)) }
					</Group>
				</Stack>

				<Stack gap="xs">
					<Text size="sm" fw={ 500 }>Conditions</Text>
					<Group gap="xs">
						{ template.conditions.map((condition) => (
							<Badge key={ condition } size="sm" variant="light" color="blue">
								{ condition }
							</Badge>
						)) }
					</Group>
				</Stack>

				<Group gap="md">
					<Badge
						size="sm"
						variant="light"
						color={ template.isActive ? "green" : "red" }
					>
						{ template.isActive ? "Active" : "Inactive" }
					</Badge>

					<Text size="sm" c="dimmed">
						Updated: { template.updatedAt.toDate().toLocaleDateString() }
					</Text>
				</Group>
			</Stack>
		</Card>
	)
}
