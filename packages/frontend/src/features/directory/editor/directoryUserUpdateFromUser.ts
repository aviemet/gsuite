import { type DirectoryUser } from "@/shared/directoryFixtures"
import { type DirectoryUserUpdate } from "@/shared/directoryUpdate"

import { deepestOrganizationalUnitPath } from "../UsersTable/deepestOrganizationalUnitPath"

export function directoryUserUpdateFromUser(user: DirectoryUser): DirectoryUserUpdate {
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
	}
}
