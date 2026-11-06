import {
	type DirectoryGroupUpdate,
	type DirectoryPhoneNumber,
	type DirectoryUserUpdate,
} from "@gsuite/shared"

import {
	type DirectoryUserProfileChanges,
} from "./directoryUpdateDiff"
import {
	type GoogleDirectoryUserLike,
	managedDirectoryPhoneType,
} from "./mapDirectoryUserProfile"

export interface GoogleUserPatchBody {
	name?: {
		givenName: string
		familyName: string
		fullName: string
	}
	orgUnitPath?: string
	organizations?: NonNullable<GoogleDirectoryUserLike["organizations"]>
	phones?: NonNullable<GoogleDirectoryUserLike["phones"]>
	addresses?: NonNullable<GoogleDirectoryUserLike["addresses"]>
	externalIds?: NonNullable<GoogleDirectoryUserLike["externalIds"]>
	relations?: NonNullable<GoogleDirectoryUserLike["relations"]>
}

export interface GoogleGroupPatchBody {
	name?: string
	email?: string
	description?: string
}

function organizationFieldsChanged(changes: DirectoryUserProfileChanges): boolean {
	return changes.jobTitle
		|| changes.department
		|| changes.organization
		|| changes.location
		|| changes.costCenter
}

function mergeOrganizations(
	current: GoogleDirectoryUserLike["organizations"],
	next: DirectoryUserUpdate,
	changes: DirectoryUserProfileChanges,
): NonNullable<GoogleDirectoryUserLike["organizations"]> {
	const organizations = (current ?? []).map((organization) => ({ ...organization }))
	const primaryIndex = organizations.findIndex((organization) => organization.primary)
	const targetIndex = primaryIndex >= 0 ? primaryIndex : 0
	const existing = organizations[targetIndex]
	const updated = {
		...(existing ?? {}),
		primary: existing?.primary ?? true,
	}
	if(changes.jobTitle) updated.title = next.jobTitle.trim()
	if(changes.department) updated.department = next.department.trim()
	if(changes.organization) updated.name = next.organization.trim()
	if(changes.location) updated.location = next.location.trim()
	if(changes.costCenter) updated.costCenter = next.costCenter.trim()
	if(existing) organizations[targetIndex] = updated
	else organizations.push(updated)
	return organizations
}

function mergePhones(
	current: GoogleDirectoryUserLike["phones"],
	phoneNumbers: readonly DirectoryPhoneNumber[],
): NonNullable<GoogleDirectoryUserLike["phones"]> {
	const preserved = (current ?? []).filter((phone) => managedDirectoryPhoneType(phone.type) === undefined)
	const managed = phoneNumbers.map((phone, index) => ({
		type: phone.type,
		value: phone.number.trim(),
		primary: index === 0,
	}))
	return [...managed, ...preserved]
}

function mergeAddresses(
	current: GoogleDirectoryUserLike["addresses"],
	address: string,
): NonNullable<GoogleDirectoryUserLike["addresses"]> {
	const addresses = (current ?? []).map((entry) => ({ ...entry }))
	const primaryIndex = addresses.findIndex((entry) => entry.primary)
	const targetIndex = primaryIndex >= 0 ? primaryIndex : (addresses.length > 0 ? 0 : -1)
	const formatted = address.trim()
	if(formatted.length === 0) {
		if(targetIndex >= 0) addresses.splice(targetIndex, 1)
		return addresses
	}
	if(targetIndex >= 0) {
		const existing = addresses[targetIndex]
		addresses[targetIndex] = {
			...(existing ?? {}),
			type: existing?.type ?? "work",
			formatted,
			primary: true,
		}
	} else {
		addresses.push({ type: "work", formatted, primary: true })
	}
	return addresses
}

function isEmployeeIdType(type: string | null | undefined): boolean {
	const normalized = type?.trim().toLowerCase() ?? ""
	return normalized === "organization" || normalized === "employee" || normalized === "employee_id"
}

function mergeExternalIds(
	current: GoogleDirectoryUserLike["externalIds"],
	employeeId: string,
): NonNullable<GoogleDirectoryUserLike["externalIds"]> {
	const externalIds = (current ?? []).map((entry) => ({ ...entry }))
	const index = externalIds.findIndex((entry) => isEmployeeIdType(entry.type))
	const value = employeeId.trim()
	if(value.length === 0) {
		if(index >= 0) externalIds.splice(index, 1)
		return externalIds
	}
	if(index >= 0) {
		const existing = externalIds[index]
		externalIds[index] = { ...(existing ?? {}), value }
	} else {
		externalIds.push({ type: "organization", value })
	}
	return externalIds
}

function mergeRelations(
	current: GoogleDirectoryUserLike["relations"],
	managerEmail: string,
): NonNullable<GoogleDirectoryUserLike["relations"]> {
	const relations = (current ?? []).map((entry) => ({ ...entry }))
	const index = relations.findIndex((entry) => entry.type?.trim().toLowerCase() === "manager")
	const value = managerEmail.trim().toLowerCase()
	if(value.length === 0) {
		if(index >= 0) relations.splice(index, 1)
		return relations
	}
	if(index >= 0) {
		const existing = relations[index]
		relations[index] = { ...(existing ?? {}), value }
	} else {
		relations.push({ type: "manager", value })
	}
	return relations
}

export function googleUserPatchBody(
	changes: DirectoryUserProfileChanges,
	next: DirectoryUserUpdate,
	current: GoogleDirectoryUserLike | undefined,
): GoogleUserPatchBody | undefined {
	const body: GoogleUserPatchBody = {}
	if(changes.givenName || changes.familyName) {
		const givenName = next.givenName.trim()
		const familyName = next.familyName.trim()
		body.name = {
			givenName,
			familyName,
			fullName: `${ givenName } ${ familyName }`.trim(),
		}
	}
	if(changes.organizationalUnitPath) {
		body.orgUnitPath = next.organizationalUnitPath.trim() || "/"
	}
	if(organizationFieldsChanged(changes)) {
		body.organizations = mergeOrganizations(current?.organizations, next, changes)
	}
	if(changes.phoneNumbers) body.phones = mergePhones(current?.phones, next.phoneNumbers)
	if(changes.address) body.addresses = mergeAddresses(current?.addresses, next.address)
	if(changes.employeeId) body.externalIds = mergeExternalIds(current?.externalIds, next.employeeId)
	if(changes.managerEmail) body.relations = mergeRelations(current?.relations, next.managerEmail)
	if(
		body.name === undefined
		&& body.orgUnitPath === undefined
		&& body.organizations === undefined
		&& body.phones === undefined
		&& body.addresses === undefined
		&& body.externalIds === undefined
		&& body.relations === undefined
	) return undefined
	return body
}

export function googleGroupPatchBody(
	baseline: DirectoryGroupUpdate,
	next: DirectoryGroupUpdate,
): GoogleGroupPatchBody | undefined {
	const body: GoogleGroupPatchBody = {}
	if(baseline.name.trim() !== next.name.trim()) body.name = next.name.trim()
	if(baseline.email.trim().toLowerCase() !== next.email.trim().toLowerCase()) {
		body.email = next.email.trim().toLowerCase()
	}
	if(baseline.description.trim() !== next.description.trim()) body.description = next.description.trim()
	if(body.name === undefined && body.email === undefined && body.description === undefined) return undefined
	return body
}
