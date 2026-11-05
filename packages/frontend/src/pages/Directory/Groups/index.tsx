import { Container, Group, Text, TextInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { useMemo, useState } from "react"

import { Page } from "@/frontend/components/Page"
import { GroupsTable } from "@/frontend/features/directory/GroupsTable"
import { filterDirectoryGroups } from "@/frontend/features/directory/GroupsTable/filterDirectoryGroups"
import { useDirectoryQuery } from "@/frontend/queries/directory"

export function DirectoryGroupsPage() {
	const { data, isLoading, error } = useDirectoryQuery()
	const [searchQuery, setSearchQuery] = useState("")

	const filteredGroups = useMemo(
		() => filterDirectoryGroups(data?.groups ?? [], searchQuery),
		[data?.groups, searchQuery],
	)

	if(error) {
		return (
			<Page title="Groups">
				<Container size="xl">
					<Text c="red">Error loading groups: { error.message }</Text>
				</Container>
			</Page>
		)
	}

	return (
		<Page title="Groups">
			<Container size="xl">
				<Group mb="md">
					<TextInput
						aria-label="Search groups"
						placeholder="Search groups"
						leftSection={ <IconSearch size={ 16 } /> }
						value={ searchQuery }
						onChange={ (event) => setSearchQuery(event.currentTarget.value) }
					/>
				</Group>
				{ !isLoading && filteredGroups.length === 0
					? (
						<Text c="dimmed">No groups found</Text>
					)
					: (
						<GroupsTable
							groups={ filteredGroups }
							users={ data?.users ?? [] }
						/>
					) }
			</Container>
		</Page>
	)
}
