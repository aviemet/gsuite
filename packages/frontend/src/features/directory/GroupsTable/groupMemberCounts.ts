import { type DirectoryGroup, type DirectoryUser } from "@/shared/directoryFixtures"

export type DirectoryGroupRow = DirectoryGroup & {
	memberCount: number
}

export function toDirectoryGroupRows(
	groups: readonly DirectoryGroup[],
	users: readonly DirectoryUser[],
): DirectoryGroupRow[] {
	const memberCounts = new Map<string, number>()

	for(const user of users) {
		for(const groupId of user.groupIds) {
			memberCounts.set(groupId, (memberCounts.get(groupId) ?? 0) + 1)
		}
	}

	return groups.map((group) => ({
		...group,
		memberCount: memberCounts.get(group.id) ?? 0,
	}))
}
