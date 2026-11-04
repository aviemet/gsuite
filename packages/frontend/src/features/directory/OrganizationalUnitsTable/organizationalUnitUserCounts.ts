import {
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
} from "@/shared/directoryFixtures"

export type DirectoryOrganizationalUnitRow = DirectoryOrganizationalUnit & {
	userCount: number
}

export function toDirectoryOrganizationalUnitRows(
	organizationalUnits: readonly DirectoryOrganizationalUnit[],
	users: readonly DirectoryUser[],
): DirectoryOrganizationalUnitRow[] {
	const userCounts = new Map<string, number>()

	for(const user of users) {
		for(const path of user.organizationalUnitPaths) {
			userCounts.set(path, (userCounts.get(path) ?? 0) + 1)
		}
	}

	return organizationalUnits.map((organizationalUnit) => ({
		...organizationalUnit,
		userCount: userCounts.get(organizationalUnit.path) ?? 0,
	}))
}
