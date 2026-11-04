import { type DirectoryGroup } from "@/shared/directoryFixtures"

export function filterDirectoryGroups(
	groups: readonly DirectoryGroup[],
	searchQuery: string,
): DirectoryGroup[] {
	const normalizedQuery = searchQuery.trim().toLowerCase()
	if(normalizedQuery.length === 0) return [...groups]

	return groups.filter((group) => {
		const haystack = [group.name, group.email].join(" ").toLowerCase()
		return haystack.includes(normalizedQuery)
	})
}
