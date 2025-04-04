import { Button, Container, Group, Title } from "@mantine/core"
import { Link } from "@tanstack/react-router"

import { SignaturesTable } from "@/frontend/components/SignaturesTable"
import { useTemplates } from "@/frontend/hooks/useTemplates"

const SignaturesListPage = () => {
	const { templates, loading, error } = useTemplates()

	if(error) {
		return (
			<Container>
				<Title c="red">Error loading signatures: { error.message }</Title>
			</Container>
		)
	}

	return (
		<Container>
			<Group justify="space-between" mb="xl">
				<Title>Signatures</Title>
				<Button component={ Link } to="/signatures/new">
					Create New Signature
				</Button>
			</Group>
			<SignaturesTable templates={ templates } loading={ loading } />
		</Container>
	)
}

export { SignaturesListPage }
