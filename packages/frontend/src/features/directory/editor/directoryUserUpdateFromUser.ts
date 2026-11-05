import { type DirectoryGroup, directoryGroupMemberRoles, type DirectoryUser } from "@/shared/directoryFixtures"
import { type DirectoryUserUpdate } from "@/shared/directoryUpdate"

import { deepestOrganizationalUnitPath } from "../UsersTable/deepestOrganizationalUnitPath"
import { directoryGroupRoleForUser } from "./userGroupMembership"

export function directoryUserUpdateFromUser(
	user: DirectoryUser,
	groups: readonly DirectoryGroup[],
): DirectoryUserUpdate {
	return {
		email: user.email,
		givenName: user.givenName,
		familyName: user.familyName,
		organizationalUnitPath: deepestOrganizationalUnitPath(user.organizationalUnitPaths) || "/",
		jobTitle: user.jobTitle,
		department: user.department,
		organization: user.organization,
		location: user.location,
		employeeId: user.employeeId,
		address: user.address,
		costCenter: user.costCenter,
		managerEmail: user.managerEmail,
		phoneNumbers: user.phoneNumbers.map((phone) => ({ ...phone })),
		groupIds: [...user.groupIds],
		groupMemberships: user.groupIds.map((groupId) => {
			const group = groups.find((entry) => entry.id === groupId)
			return {
				groupId,
				role: group
					? directoryGroupRoleForUser(user.email, group, undefined)
					: directoryGroupMemberRoles.member,
			}
		}),
	}
}
