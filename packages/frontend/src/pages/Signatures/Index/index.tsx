import { Button, Container, Group, SegmentedControl, Select, Text, TextInput } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { IconLayoutGrid, IconList, IconSearch } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { Page } from "@/frontend/components/Page"
import { SignatureGrid } from "@/frontend/features/signatures/SignatureGrid"
import { SignaturesTable } from "@/frontend/features/signatures/SignaturesTable"
import { useTemplatesQuery } from "@/frontend/queries/templates"

type StatusFilter = "active" | "inactive" | null

export function SignaturesListPage() {
	const { data: templates = [], isLoading, error } = useTemplatesQuery()
	const [viewMode, setViewMode] = useLocalStorage<"table" | "grid">({
		key: "signatures-view-mode",
		defaultValue: "grid",
	})
	const [searchQuery, setSearchQuery] = useState("")
	const [statusFilter, setStatusFilter] = useState<StatusFilter>(null)

	const filteredTemplates = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase()

		return templates.filter((template) => {
			const matchesSearch = normalizedQuery.length === 0 || template.name.toLowerCase().includes(normalizedQuery)
			const matchesStatus = statusFilter === null
				? true
				: template.isActive === (statusFilter === "active")

			return matchesSearch && matchesStatus
		})
	}, [templates, searchQuery, statusFilter])

	if(error) {
		return (
			<Page title="Signatures">
				<Container>
					<Text c="red">Error loading signatures: { error.message }</Text>
				</Container>
			</Page>
		)
	}

	return (
		<Page title="Signatures">
			<Container>
				<Group justify="space-between" mb="md">
					<Group>
						<TextInput
							placeholder="Search signatures"
							leftSection={ <IconSearch size={ 16 } /> }
							value={ searchQuery }
							onChange={ (event) => setSearchQuery(event.currentTarget.value) }
						/>
						<Select
							placeholder="Status"
							clearable
							data={ [
								{ value: "active", label: "Active" },
								{ value: "inactive", label: "Inactive" },
							] }
							value={ statusFilter }
							onChange={ (value) => {
								if(value === "active" || value === "inactive" || value === null) {
									setStatusFilter(value)
								}
							} }
						/>
					</Group>
					<Group>
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
						<Button component={ Link } to="/signatures/edit">
							Create New Signature
						</Button>
					</Group>
				</Group>
				{ !isLoading && filteredTemplates.length === 0
					? (
						<Text c="dimmed">No signatures found</Text>
					)
					: viewMode === "table"
						? (
							<SignaturesTable templates={ filteredTemplates } loading={ isLoading } />
						)
						: (
							<SignatureGrid templates={ filteredTemplates } loading={ isLoading } />
						) }
			</Container>
		</Page>
	)
}
