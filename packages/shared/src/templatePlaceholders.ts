import { Person } from "./person.testdata"

export const placeholderCategories = ["details", "company", "social"] as const

export type PlaceholderCategory = typeof placeholderCategories[number]

export interface TemplatePlaceholder {
	token: string
	label: string
	category: PlaceholderCategory
	directoryField: string
	description: string
}

export const templatePlaceholders = [
	{
		token: "fullName",
		label: "Full name",
		category: "details",
		directoryField: "name.fullName",
		description: "Given name and family name from the Directory profile",
	},
	{
		token: "givenName",
		label: "First name",
		category: "details",
		directoryField: "name.givenName",
		description: "Given name on the Directory profile",
	},
	{
		token: "familyName",
		label: "Last name",
		category: "details",
		directoryField: "name.familyName",
		description: "Family name on the Directory profile",
	},
	{
		token: "employeeId",
		label: "Employee ID",
		category: "details",
		directoryField: "externalIds[type=organization]",
		description: "Organization employee ID on the Directory profile",
	},
	{
		token: "email",
		label: "Email address",
		category: "details",
		directoryField: "primaryEmail",
		description: "Primary Workspace email address",
	},
	{
		token: "address",
		label: "Address",
		category: "details",
		directoryField: "addresses[primary].formatted",
		description: "Primary formatted address on the Directory profile",
	},
	{
		token: "jobTitle",
		label: "Job title",
		category: "details",
		directoryField: "organizations[primary].title",
		description: "Title on the user's primary organization",
	},
	{
		token: "department",
		label: "Department",
		category: "details",
		directoryField: "organizations[primary].department",
		description: "Department on the user's primary organization",
	},
	{
		token: "workPhone",
		label: "Work phone",
		category: "details",
		directoryField: "phones[type=work]",
		description: "Work phone number on the Directory profile",
	},
	{
		token: "homePhone",
		label: "Home phone",
		category: "details",
		directoryField: "phones[type=home]",
		description: "Home phone number on the Directory profile",
	},
	{
		token: "mobile",
		label: "Mobile",
		category: "details",
		directoryField: "phones[type=mobile]",
		description: "Mobile phone number on the Directory profile",
	},
	{
		token: "photoUrl",
		label: "Profile picture",
		category: "details",
		directoryField: "thumbnailPhotoUrl",
		description: "Directory thumbnail photo URL",
	},
	{
		token: "company",
		label: "Company name",
		category: "company",
		directoryField: "organizations[primary].name",
		description: "Name of the user's primary organization",
	},
	{
		token: "costCenter",
		label: "Cost center",
		category: "company",
		directoryField: "organizations[primary].costCenter",
		description: "Cost center on the user's primary organization",
	},
	{
		token: "companyLocation",
		label: "Location",
		category: "company",
		directoryField: "organizations[primary].location",
		description: "Location on the user's primary organization",
	},
	{
		token: "companyDescription",
		label: "Description",
		category: "company",
		directoryField: "organizations[primary].description",
		description: "Description on the user's primary organization",
	},
	{
		token: "companyDomain",
		label: "Domain",
		category: "company",
		directoryField: "organizations[primary].domain",
		description: "Domain on the user's primary organization",
	},
	{
		token: "managerEmail",
		label: "Manager",
		category: "company",
		directoryField: "relations[type=manager]",
		description: "Manager relation on the Directory profile",
	},
	{
		token: "buildingId",
		label: "Building",
		category: "company",
		directoryField: "locations[].buildingId",
		description: "Building ID from Directory locations",
	},
	{
		token: "floorName",
		label: "Floor",
		category: "company",
		directoryField: "locations[].floorName",
		description: "Floor name from Directory locations",
	},
	{
		token: "floorSection",
		label: "Floor section",
		category: "company",
		directoryField: "locations[].floorSection",
		description: "Floor section from Directory locations",
	},
	{
		token: "deskCode",
		label: "Desk",
		category: "company",
		directoryField: "locations[].deskCode",
		description: "Desk code from Directory locations",
	},
	{
		token: "website",
		label: "Website",
		category: "social",
		directoryField: "websites[primary]",
		description: "Primary website on the Directory profile",
	},
	{
		token: "workWebsite",
		label: "Work website",
		category: "social",
		directoryField: "websites[type=work]",
		description: "Work website on the Directory profile",
	},
	{
		token: "homeWebsite",
		label: "Home website",
		category: "social",
		directoryField: "websites[type=home]",
		description: "Home website on the Directory profile",
	},
	{
		token: "blog",
		label: "Blog",
		category: "social",
		directoryField: "websites[type=blog]",
		description: "Blog website on the Directory profile",
	},
	{
		token: "profileUrl",
		label: "Profile",
		category: "social",
		directoryField: "websites[type=profile]",
		description: "Profile website on the Directory profile",
	},
] as const satisfies readonly TemplatePlaceholder[]

export type PlaceholderToken = typeof templatePlaceholders[number]["token"]

export type PlaceholderInsertMode = "value" | "conditional"

export function getPlaceholderInsertValue(
	placeholder: TemplatePlaceholder,
	mode: PlaceholderInsertMode,
): string {
	if(mode === "conditional") {
		return `{{#if ${ placeholder.token }}}{{${ placeholder.token }}}{{/if}}`
	}

	return `{{${ placeholder.token }}}`
}

function phoneNumber(person: Person, type: Person["phoneNumbers"][number]["type"]): string {
	return person.phoneNumbers.find((entry) => entry.type === type)?.number ?? ""
}

export function getTemplatePreviewContext(person: Person): Record<string, string> {
	const values: Record<PlaceholderToken, string> = {
		fullName: person.displayName,
		givenName: person.firstName,
		familyName: person.lastName,
		employeeId: person.employeeId,
		email: person.primaryEmail,
		address: person.address,
		jobTitle: person.jobTitle,
		department: person.department,
		workPhone: phoneNumber(person, "work"),
		homePhone: phoneNumber(person, "home"),
		mobile: phoneNumber(person, "mobile"),
		photoUrl: person.photoUrl,
		company: person.organization,
		costCenter: person.costCenter,
		companyLocation: person.location,
		companyDescription: person.companyDescription,
		companyDomain: person.companyDomain,
		managerEmail: person.managerEmail,
		buildingId: person.buildingId,
		floorName: person.floorName,
		floorSection: person.floorSection,
		deskCode: person.deskCode,
		website: person.website,
		workWebsite: person.workWebsite,
		homeWebsite: person.homeWebsite,
		blog: person.blog,
		profileUrl: person.profileUrl,
	}

	return {
		...values,
		name: values.fullName,
		title: values.jobTitle,
		phone: values.mobile,
		firstName: values.givenName,
		lastName: values.familyName,
		displayName: values.fullName,
		primaryEmail: values.email,
	}
}
