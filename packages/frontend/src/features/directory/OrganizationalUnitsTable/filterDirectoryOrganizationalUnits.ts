import { type DirectoryOrganizationalUnit } from "@/shared/directoryFixtures"

export function filterDirectoryOrganizationalUnits(
	organizationalUnits: readonly DirectoryOrganizationalUnit[],
	searchQuery: string,
): DirectoryOrganizationalUnit[] {
	const normalizedQuery = searchQuery.trim().toLowerCase()
	if(normalizedQuery.length === 0) return [...organizationalUnits]

	return organizationalUnits.filter((organizationalUnit) => {
		const haystack = [organizationalUnit.name, organizationalUnit.path].join(" ").toLowerCase()
		return haystack.includes(normalizedQuery)
	})
}
