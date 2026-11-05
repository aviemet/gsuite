import { type DirectoryUser } from "@/shared/directoryFixtures"
import { type DirectoryGroupUpdate, directoryUserGroupRole, type DirectoryUserUpdate, nextGroupMembersForUser } from "@/shared/directoryUpdate"

import { type DirectorySnapshot } from "./directory"

function organizationalUnitPaths(orgUnitPath: string): string[] {
	const trimmed = orgUnitPath.trim()
	if(!trimmed || trimmed === "/") return ["/"]
	const segments = trimmed.split("/").filter((segment) => segment.length > 0)
	const paths = ["/"]
	let current = ""
	for(const segment of segments) {
		current = `${ current }/${ segment }`
		paths.push(current)
	}
	return paths
}

function userFromUpdate(current: DirectoryUser, update: DirectoryUserUpdate): DirectoryUser {
	const givenName = update.givenName.trim()
	const familyName = update.familyName.trim()
	const displayName = `${ givenName } ${ familyName }`.trim() || current.displayName
	return {
		...current,
		displayName,
		givenName,
		familyName,
		jobTitle: update.jobTitle.trim(),
		department: update.department.trim(),
		organization: update.organization.trim(),
		location: update.location.trim(),
		employeeId: update.employeeId.trim(),
		address: update.address.trim(),
		costCenter: update.costCenter.trim(),
		managerEmail: update.managerEmail.trim().toLowerCase(),
		phoneNumbers: update.phoneNumbers.map((phone) => ({
			type: phone.type,
			number: phone.number.trim(),
		})),
		groupIds: [...update.groupIds],
		organizationalUnitPaths: organizationalUnitPaths(update.organizationalUnitPath),
	}
}

export function applyDirectoryUserUpdate(
	snapshot: DirectorySnapshot,
	update: DirectoryUserUpdate,
): DirectorySnapshot {
	const email = update.email.trim().toLowerCase()
	const index = snapshot.users.findIndex((user) => user.email === email)
	if(index < 0) return snapshot

	const nextUser = userFromUpdate(snapshot.users[index], update)
	const nextGroupIds = new Set(nextUser.groupIds)
	const users = snapshot.users.map((user, userIndex) => userIndex === index ? nextUser : user)
	const groups = snapshot.groups.map((group) => ({
		...group,
		members: nextGroupMembersForUser(
			group.members,
			email,
			nextGroupIds.has(group.id),
			directoryUserGroupRole(group.id, update.groupMemberships),
		),
	}))

	return { ...snapshot, users, groups }
}

export function applyDirectoryGroupUpdate(
	snapshot: DirectorySnapshot,
	update: DirectoryGroupUpdate,
): DirectorySnapshot {
	const index = snapshot.groups.findIndex((group) => group.id === update.id)
	if(index < 0) return snapshot

	const members = update.members.map((member) => ({
		email: member.email.trim().toLowerCase(),
		role: member.role,
	}))
	const groups = snapshot.groups.map((group, groupIndex) => (
		groupIndex === index
			? {
				...group,
				name: update.name.trim(),
				email: update.email.trim().toLowerCase(),
				description: update.description.trim(),
				members,
			}
			: group
	))
	const memberEmails = new Set(members.map((member) => member.email))
	const users = snapshot.users.map((user) => {
		const isMember = memberEmails.has(user.email)
		const hasGroup = user.groupIds.includes(update.id)
		if(isMember && !hasGroup) return { ...user, groupIds: [...user.groupIds, update.id] }
		if(!isMember && hasGroup) {
			return { ...user, groupIds: user.groupIds.filter((groupId) => groupId !== update.id) }
		}
		return user
	})

	return { ...snapshot, users, groups }
}

export function applyDirectoryUpdate(
	snapshot: DirectorySnapshot,
	update: DirectoryUserUpdate | DirectoryGroupUpdate,
): DirectorySnapshot {
	if("groupIds" in update) return applyDirectoryUserUpdate(snapshot, update)
	return applyDirectoryGroupUpdate(snapshot, update)
}
