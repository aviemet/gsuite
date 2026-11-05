import { type DirectoryGroup } from "@/shared/directoryFixtures"
import { type DirectoryGroupUpdate } from "@/shared/directoryUpdate"

export function directoryGroupUpdateFromGroup(group: DirectoryGroup): DirectoryGroupUpdate {
	return {
		id: group.id,
		name: group.name,
		email: group.email,
		description: group.description,
		members: group.members.map((member) => ({ ...member })),
	}
}
