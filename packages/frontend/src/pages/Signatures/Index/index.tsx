import { Button, Container, Group, SegmentedControl, Title } from "@mantine/core"
import { IconLayoutGrid, IconList } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import { useState } from "react"

import { SignatureGrid } from "@/frontend/components/SignatureGrid"
import { SignaturesTable } from "@/frontend/components/SignaturesTable"
import { useTemplatesQuery } from "@/frontend/queries/templates"

const SignaturesListPage = () => {
	const { data: templates = [], isLoading, error } = useTemplatesQuery()
	const [viewMode, setViewMode] = useState<"table" | "grid">("grid")
	console.log({ templates })
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
				<Button component={ Link } to="/signatures/edit">
					Create New Signature
				</Button>
			</Group>
			<Group justify="flex-end" mb="md">
				<SegmentedControl
					size="xs"
					value={ viewMode }
					onChange={ (value) => setViewMode(value as "table" | "grid") }
					data={ [
						{
							value: "grid",
							label: <IconLayoutGrid size="1rem" />,
						},
						{
							value: "table",
							label: <IconList size="1rem" />,
						},
					] }
					styles={ {
						root: {
							border: "1px solid var(--mantine-color-gray-3)",
						},
						label: {
							lineHeight: 1,
						},
					} }
				/>
			</Group>
			{ viewMode === "table"
				? (
					<SignaturesTable templates={ templates } loading={ isLoading } />
				)
				: (
					<SignatureGrid templates={ templates } loading={ isLoading } />
				) }
		</Container>
	)
}

export { SignaturesListPage }
