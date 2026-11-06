import { type DirectoryGroup } from "@gsuite/shared"

import { type DirectoryClient } from "../directory/client"

export async function assignedGroupsForSave(
	directory: Pick<DirectoryClient, "getGroup">,
	groupIds: readonly string[],
): Promise<DirectoryGroup[]> {
	if(groupIds.length !== 1) return []
	const groupId = groupIds[0]
	if(!groupId) return []
	const group = await directory.getGroup(groupId)
	return group ? [group] : []
}
