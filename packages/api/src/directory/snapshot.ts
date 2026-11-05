import {
	type DirectoryGroup,
	type DirectoryGroupMemberRole,
	type DirectoryOrganizationalUnit,
	type DirectoryPhoneNumber,
	type DirectoryUser,
	emptyDirectoryProfile,
	isDirectoryGroupMemberRole,
} from "@gsuite/shared"

import { type DirectorySnapshot } from "./client"

export interface RawDirectoryUser {
	email: string
	displayName: string
	orgUnitPath: string
	givenName?: string
	familyName?: string
	jobTitle?: string
	department?: string
	organization?: string
	location?: string
	employeeId?: string
	address?: string
	photoUrl?: string
	costCenter?: string
	companyDescription?: string
	managerEmail?: string
	buildingId?: string
	floorName?: string
	floorSection?: string
	deskCode?: string
	website?: string
	workWebsite?: string
	homeWebsite?: string
	blog?: string
	profileUrl?: string
	phoneNumbers?: DirectoryPhoneNumber[]
}

export interface RawDirectoryGroup {
	id: string
	name: string
	email: string
	description?: string
}

export interface RawDirectoryMember {
	groupId: string
	email: string
	role?: string
}

export function organizationalUnitPaths(orgUnitPath: string): string[] {
	if(!orgUnitPath || orgUnitPath === "/") return ["/"]
	const segments = orgUnitPath.split("/").filter((segment) => segment.length > 0)
	const paths = ["/"]
	let current = ""
	for(const segment of segments) {
		current = `${current}/${segment}`
		paths.push(current)
	}
	return paths
}

export function buildDirectorySnapshot(input: {
	users: RawDirectoryUser[]
	groups: RawDirectoryGroup[]
	members: RawDirectoryMember[]
	organizationalUnits: DirectoryOrganizationalUnit[]
}): DirectorySnapshot {
	const groupIdsByEmail = new Map<string, string[]>()
	const membersByGroupId = new Map<string, { email: string, role: DirectoryGroupMemberRole }[]>()
	for(const member of input.members) {
		const email = member.email.toLowerCase()
		const groupIds = groupIdsByEmail.get(email) ?? []
		groupIds.push(member.groupId)
		groupIdsByEmail.set(email, groupIds)
		const members = membersByGroupId.get(member.groupId) ?? []
		const role = isDirectoryGroupMemberRole(member.role) ? member.role : "MEMBER"
		members.push({ email, role })
		membersByGroupId.set(member.groupId, members)
	}

	const users: DirectoryUser[] = input.users.map((user) => {
		const empty = emptyDirectoryProfile()
		return {
			...empty,
			email: user.email.toLowerCase(),
			displayName: user.displayName || user.email,
			givenName: user.givenName ?? empty.givenName,
			familyName: user.familyName ?? empty.familyName,
			signatureHtml: "",
			groupIds: groupIdsByEmail.get(user.email.toLowerCase()) ?? [],
			organizationalUnitPaths: organizationalUnitPaths(user.orgUnitPath),
			jobTitle: user.jobTitle ?? empty.jobTitle,
			department: user.department ?? empty.department,
			organization: user.organization ?? empty.organization,
			location: user.location ?? empty.location,
			employeeId: user.employeeId ?? empty.employeeId,
			address: user.address ?? empty.address,
			photoUrl: user.photoUrl ?? empty.photoUrl,
			costCenter: user.costCenter ?? empty.costCenter,
			companyDescription: user.companyDescription ?? empty.companyDescription,
			managerEmail: user.managerEmail ?? empty.managerEmail,
			buildingId: user.buildingId ?? empty.buildingId,
			floorName: user.floorName ?? empty.floorName,
			floorSection: user.floorSection ?? empty.floorSection,
			deskCode: user.deskCode ?? empty.deskCode,
			website: user.website ?? empty.website,
			workWebsite: user.workWebsite ?? empty.workWebsite,
			homeWebsite: user.homeWebsite ?? empty.homeWebsite,
			blog: user.blog ?? empty.blog,
			profileUrl: user.profileUrl ?? empty.profileUrl,
			phoneNumbers: user.phoneNumbers ?? empty.phoneNumbers,
		}
	})

	const groups: DirectoryGroup[] = input.groups.map((group) => ({
		id: group.id,
		name: group.name,
		email: group.email.toLowerCase(),
		description: group.description ?? "",
		members: membersByGroupId.get(group.id) ?? [],
	}))

	const organizationalUnits = [...input.organizationalUnits]
	if(!organizationalUnits.some((unit) => unit.path === "/")) {
		organizationalUnits.unshift({ path: "/", name: "Workspace" })
	}

	return { users, groups, organizationalUnits }
}
