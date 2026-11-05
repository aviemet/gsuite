import {
	type DirectoryGroupMember,
	type DirectoryGroupUpdate,
	type DirectoryPhoneNumber,
	type DirectoryUserGroupMembership,
	type DirectoryUserUpdate,
	isDirectoryGroupMemberRole,
} from "@gsuite/shared"

import { HttpError } from "../http/errors"

function hasKey(value: object, key: string): boolean {
	return Object.prototype.hasOwnProperty.call(value, key)
}

function readString(value: object, key: string): string {
	if(!hasKey(value, key)) return ""
	const field = Reflect.get(value, key)
	return typeof field === "string" ? field : ""
}

function requireEmail(value: object, key: string, label: string): string {
	const email = readString(value, key).trim().toLowerCase()
	if(!email.includes("@")) throw new HttpError(`${ label } is required`, 400)
	return email
}

function readStringList(value: object, key: string): string[] {
	if(!hasKey(value, key)) return []
	const field = Reflect.get(value, key)
	if(!Array.isArray(field)) throw new HttpError(`Invalid ${ key }`, 400)
	return field.flatMap((entry) => typeof entry === "string" ? [entry] : [])
}

function readPhoneNumbers(value: object): DirectoryPhoneNumber[] {
	if(!hasKey(value, "phoneNumbers")) return []
	const field = Reflect.get(value, "phoneNumbers")
	if(!Array.isArray(field)) throw new HttpError("Invalid phone numbers", 400)
	return field.flatMap((entry) => {
		if(!entry || typeof entry !== "object") return []
		const type = readString(entry, "type")
		const number = readString(entry, "number").trim()
		if(!number) return []
		if(type !== "mobile" && type !== "work" && type !== "home") {
			throw new HttpError("Invalid phone type", 400)
		}
		return [{ type, number }]
	})
}

function readGroupMemberships(value: object): DirectoryUserGroupMembership[] | undefined {
	if(!hasKey(value, "groupMemberships")) return undefined
	const field = Reflect.get(value, "groupMemberships")
	if(!Array.isArray(field)) throw new HttpError("Invalid group memberships", 400)
	return field.map((entry) => {
		if(!entry || typeof entry !== "object") throw new HttpError("Invalid group memberships", 400)
		const groupId = readString(entry, "groupId").trim()
		const role = hasKey(entry, "role") ? Reflect.get(entry, "role") : undefined
		if(!groupId || !isDirectoryGroupMemberRole(role)) throw new HttpError("Invalid member role", 400)
		return { groupId, role }
	})
}

function readMembers(value: object): DirectoryGroupMember[] {
	if(!hasKey(value, "members")) return []
	const field = Reflect.get(value, "members")
	if(!Array.isArray(field)) throw new HttpError("Invalid members", 400)
	return field.map((entry) => {
		if(!entry || typeof entry !== "object") throw new HttpError("Invalid members", 400)
		const email = requireEmail(entry, "email", "Member email")
		const role = hasKey(entry, "role") ? Reflect.get(entry, "role") : undefined
		if(!isDirectoryGroupMemberRole(role)) throw new HttpError("Invalid member role", 400)
		return { email, role }
	})
}

export function parseDirectoryUserUpdate(body: unknown): DirectoryUserUpdate {
	if(!body || typeof body !== "object") throw new HttpError("Invalid request body", 400)
	return {
		email: requireEmail(body, "email", "User email"),
		givenName: readString(body, "givenName").trim(),
		familyName: readString(body, "familyName").trim(),
		organizationalUnitPath: readString(body, "organizationalUnitPath").trim() || "/",
		jobTitle: readString(body, "jobTitle").trim(),
		department: readString(body, "department").trim(),
		organization: readString(body, "organization").trim(),
		location: readString(body, "location").trim(),
		employeeId: readString(body, "employeeId").trim(),
		address: readString(body, "address").trim(),
		costCenter: readString(body, "costCenter").trim(),
		managerEmail: readString(body, "managerEmail").trim().toLowerCase(),
		phoneNumbers: readPhoneNumbers(body),
		groupIds: readStringList(body, "groupIds"),
		groupMemberships: readGroupMemberships(body),
	}
}

export function parseDirectoryGroupUpdate(body: unknown): DirectoryGroupUpdate {
	if(!body || typeof body !== "object") throw new HttpError("Invalid request body", 400)
	const id = readString(body, "id").trim()
	if(!id) throw new HttpError("Group id is required", 400)
	const name = readString(body, "name").trim()
	if(!name) throw new HttpError("Group name is required", 400)
	return {
		id,
		name,
		email: requireEmail(body, "email", "Group email"),
		description: readString(body, "description").trim(),
		members: readMembers(body),
	}
}
