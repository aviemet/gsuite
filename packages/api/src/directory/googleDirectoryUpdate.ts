import {
	type DirectoryUserUpdate,
} from "@gsuite/shared"

export interface GoogleUserUpdateBody {
	name: {
		givenName: string
		familyName: string
		fullName: string
	}
	orgUnitPath: string
	organizations: Array<{
		primary: boolean
		title: string
		department: string
		name: string
		location: string
		costCenter: string
	}>
	phones: Array<{
		type: string
		value: string
		primary: boolean
	}>
	addresses: Array<{
		type: string
		formatted: string
		primary: boolean
	}>
	externalIds: Array<{
		type: string
		value: string
	}>
	relations: Array<{
		type: string
		value: string
	}>
}

export function googleUserUpdateBody(update: DirectoryUserUpdate): GoogleUserUpdateBody {
	const givenName = update.givenName.trim()
	const familyName = update.familyName.trim()
	return {
		name: {
			givenName,
			familyName,
			fullName: `${ givenName } ${ familyName }`.trim(),
		},
		orgUnitPath: update.organizationalUnitPath.trim() || "/",
		organizations: [{
			primary: true,
			title: update.jobTitle.trim(),
			department: update.department.trim(),
			name: update.organization.trim(),
			location: update.location.trim(),
			costCenter: update.costCenter.trim(),
		}],
		phones: update.phoneNumbers.map((phone, index) => ({
			type: phone.type,
			value: phone.number.trim(),
			primary: index === 0,
		})),
		addresses: update.address.trim().length === 0
			? []
			: [{
				type: "work",
				formatted: update.address.trim(),
				primary: true,
			}],
		externalIds: update.employeeId.trim().length === 0
			? []
			: [{
				type: "organization",
				value: update.employeeId.trim(),
			}],
		relations: update.managerEmail.trim().length === 0
			? []
			: [{
				type: "manager",
				value: update.managerEmail.trim(),
			}],
	}
}

export interface GoogleGroupUpdateBody {
	name: string
	email: string
	description: string
}

export function googleGroupUpdateBody(update: {
	name: string
	email: string
	description: string
}): GoogleGroupUpdateBody {
	return {
		name: update.name.trim(),
		email: update.email.trim().toLowerCase(),
		description: update.description.trim(),
	}
}
