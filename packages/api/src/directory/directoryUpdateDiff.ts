import {
	type DirectoryGroupMemberRole,
	type DirectoryPhoneNumber,
	directoryUserGroupRole,
	type DirectoryUserUpdate,
} from "@gsuite/shared"

export interface DirectoryUserProfileChanges {
	givenName: boolean
	familyName: boolean
	organizationalUnitPath: boolean
	jobTitle: boolean
	department: boolean
	organization: boolean
	location: boolean
	costCenter: boolean
	employeeId: boolean
	address: boolean
	managerEmail: boolean
	phoneNumbers: boolean
}

function sameText(left: string, right: string): boolean {
	return left.trim() === right.trim()
}

function normalizedOrgUnit(path: string): string {
	const trimmed = path.trim()
	return trimmed.length === 0 ? "/" : trimmed
}

function samePhones(left: readonly DirectoryPhoneNumber[], right: readonly DirectoryPhoneNumber[]): boolean {
	if(left.length !== right.length) return false
	return left.every((phone, index) => {
		const other = right[index]
		return other !== undefined
			&& phone.type === other.type
			&& phone.number.trim() === other.number.trim()
	})
}

export function directoryUserProfileChanges(
	baseline: DirectoryUserUpdate,
	next: DirectoryUserUpdate,
): DirectoryUserProfileChanges {
	return {
		givenName: !sameText(baseline.givenName, next.givenName),
		familyName: !sameText(baseline.familyName, next.familyName),
		organizationalUnitPath: normalizedOrgUnit(baseline.organizationalUnitPath) !== normalizedOrgUnit(next.organizationalUnitPath),
		jobTitle: !sameText(baseline.jobTitle, next.jobTitle),
		department: !sameText(baseline.department, next.department),
		organization: !sameText(baseline.organization, next.organization),
		location: !sameText(baseline.location, next.location),
		costCenter: !sameText(baseline.costCenter, next.costCenter),
		employeeId: !sameText(baseline.employeeId, next.employeeId),
		address: !sameText(baseline.address, next.address),
		managerEmail: baseline.managerEmail.trim().toLowerCase() !== next.managerEmail.trim().toLowerCase(),
		phoneNumbers: !samePhones(baseline.phoneNumbers, next.phoneNumbers),
	}
}

export function hasDirectoryUserProfileChange(changes: DirectoryUserProfileChanges): boolean {
	return Object.values(changes).some((changed) => changed)
}

export function directoryUserNeedsProfileRead(changes: DirectoryUserProfileChanges): boolean {
	return changes.jobTitle
		|| changes.department
		|| changes.organization
		|| changes.location
		|| changes.costCenter
		|| changes.employeeId
		|| changes.address
		|| changes.managerEmail
		|| changes.phoneNumbers
}

function membershipByGroup(update: DirectoryUserUpdate): Map<string, DirectoryGroupMemberRole> {
	const memberships = new Map<string, DirectoryGroupMemberRole>()
	for(const groupId of update.groupIds) {
		const trimmed = groupId.trim()
		if(trimmed.length === 0 || memberships.has(trimmed)) continue
		memberships.set(trimmed, directoryUserGroupRole(trimmed, update.groupMemberships))
	}
	return memberships
}

export type DirectoryMembershipChange =
	| { action: "insert", groupId: string, role: DirectoryGroupMemberRole }
	| { action: "update", groupId: string, role: DirectoryGroupMemberRole }
	| { action: "delete", groupId: string }

export function directoryUserMembershipChanges(
	baseline: DirectoryUserUpdate,
	next: DirectoryUserUpdate,
): DirectoryMembershipChange[] {
	const current = membershipByGroup(baseline)
	const desired = membershipByGroup(next)
	const changes: DirectoryMembershipChange[] = []

	for(const [groupId, role] of current) {
		const nextRole = desired.get(groupId)
		if(nextRole === undefined) {
			changes.push({ action: "delete", groupId })
			continue
		}
		if(nextRole !== role) changes.push({ action: "update", groupId, role: nextRole })
	}

	for(const [groupId, role] of desired) {
		if(current.has(groupId)) continue
		changes.push({ action: "insert", groupId, role })
	}

	return changes
}
