import { Container, Group, Text, TextInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { useMemo, useState } from "react"

import { Page } from "@/frontend/components/Page"
import { OrganizationalUnitsTable } from "@/frontend/features/directory/OrganizationalUnitsTable"
import { filterDirectoryOrganizationalUnits } from "@/frontend/features/directory/OrganizationalUnitsTable/filterDirectoryOrganizationalUnits"
import { useDirectoryQuery } from "@/frontend/queries/directory"

export function DirectoryOrganizationalUnitsPage() {
	const { data, isLoading, error } = useDirectoryQuery()
	const [searchQuery, setSearchQuery] = useState("")

	const filteredOrganizationalUnits = useMemo(
		() => filterDirectoryOrganizationalUnits(data?.organizationalUnits ?? [], searchQuery),
		[data?.organizationalUnits, searchQuery],
	)

	if(error) {
		return (
			<Page title="OUs">
				<Container size="xl">
					<Text c="red">Error loading organizational units: { error.message }</Text>
				</Container>
			</Page>
		)
	}

	return (
		<Page title="OUs">
			<Container size="xl">
				<Group mb="md">
					<TextInput
						aria-label="Search organizational units"
						placeholder="Search organizational units"
						leftSection={ <IconSearch size={ 16 } /> }
						value={ searchQuery }
						onChange={ (event) => setSearchQuery(event.currentTarget.value) }
					/>
				</Group>
				{ !isLoading && filteredOrganizationalUnits.length === 0
					? (
						<Text c="dimmed">No organizational units found</Text>
					)
					: (
						<OrganizationalUnitsTable
							organizationalUnits={ filteredOrganizationalUnits }
							users={ data?.users ?? [] }
						/>
					) }
			</Container>
		</Page>
	)
}
