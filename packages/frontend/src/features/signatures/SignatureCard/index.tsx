import { Badge, Card, Group, Stack, Text, Button } from "@mantine/core"
import { IconPencil } from "@tabler/icons-react"
import { Link, useRouter } from "@tanstack/react-router"
import clsx from "clsx"
import { Template } from "@/frontend/types/firebase"
import * as classes from "./SignatureCard.css"

interface SignatureCardProps {
	template: Template
}

export const SignatureCard = ({ template }: SignatureCardProps) => {
	const router = useRouter()
	return (
		<Card
			withBorder
			radius="md"
			padding="lg"
			className={ clsx(classes.cardRoot) }
		>
			<Group justify="space-between" align="flex-start" mb="md">
				<Text fw={ 700 } size="lg" component={ Link } to={ `/signatures/${template.id}` } style={ { textDecoration: "none", color: "inherit", cursor: "pointer" } }>
					{ template.name }
				</Text>
				<Button
					variant="subtle"
					size="xs"
					className={ clsx(classes.editButton) }
					onClick={ () => router.navigate({ to: "/signatures/edit/$id", params: { id: template.id } }) }
				>
					<IconPencil size={ 16 } />
				</Button>
			</Group>
			<Stack gap="md">
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
