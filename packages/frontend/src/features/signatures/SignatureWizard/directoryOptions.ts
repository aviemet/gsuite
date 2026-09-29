import {
	type DirectoryGroup,
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
} from "@/shared/directoryFixtures"

import { buildOrganizationalUnitTree } from "./buildOrganizationalUnitTree"

export function toUserSelectData(users: DirectoryUser[]) {
	return users.map((user) => ({
		value: user.email,
		label: `${user.displayName} (${user.email})`,
	}))
}

export function toGroupSelectData(groups: DirectoryGroup[]) {
	return groups.map((group) => ({
		value: group.id,
		label: group.name,
	}))
}

export function toOrganizationalUnitTreeData(units: DirectoryOrganizationalUnit[]) {
	return buildOrganizationalUnitTree(units)
}

export function findDirectoryUser(
	users: DirectoryUser[],
	email: string,
): DirectoryUser | undefined {
	return users.find((user) => user.email === email)
}

export function findDirectoryGroup(
	groups: DirectoryGroup[],
	groupId: string,
): DirectoryGroup | undefined {
	return groups.find((group) => group.id === groupId)
}

export function findDirectoryOrganizationalUnit(
	units: DirectoryOrganizationalUnit[],
	path: string,
): DirectoryOrganizationalUnit | undefined {
	return units.find((unit) => unit.path === path)
}
