import { type Person, samplePerson } from "./person.testdata"

export const placeholderCategories = ["details", "company", "social"] as const

export type PlaceholderCategory = typeof placeholderCategories[number]

export interface TemplatePlaceholder {
	token: string
	label: string
	category: PlaceholderCategory
	directoryField: string
	description: string
	read: (person: Person) => string
}

function phoneNumber(person: Person, type: Person["phoneNumbers"][number]["type"]): string {
	return person.phoneNumbers.find((entry) => entry.type === type)?.number ?? ""
}

export const templatePlaceholders = [
	{
		token: "fullName",
		label: "Full name",
		category: "details",
		directoryField: "name.fullName",
		description: "Given name and family name from the Directory profile",
		read: (person) => person.displayName,
	},
	{
		token: "givenName",
		label: "First name",
		category: "details",
		directoryField: "name.givenName",
		description: "Given name on the Directory profile",
		read: (person) => person.firstName,
	},
	{
		token: "familyName",
		label: "Last name",
		category: "details",
		directoryField: "name.familyName",
		description: "Family name on the Directory profile",
		read: (person) => person.lastName,
	},
	{
		token: "employeeId",
		label: "Employee ID",
		category: "details",
		directoryField: "externalIds[type=organization]",
		description: "Organization employee ID on the Directory profile",
		read: (person) => person.employeeId,
	},
	{
		token: "email",
		label: "Email address",
		category: "details",
		directoryField: "primaryEmail",
		description: "Primary Workspace email address",
		read: (person) => person.primaryEmail,
	},
	{
		token: "address",
		label: "Address",
		category: "details",
		directoryField: "addresses[primary].formatted",
		description: "Primary formatted address on the Directory profile",
		read: (person) => person.address,
	},
	{
		token: "jobTitle",
		label: "Job title",
		category: "details",
		directoryField: "organizations[primary].title",
		description: "Title on the user's primary organization",
		read: (person) => person.jobTitle,
	},
	{
		token: "department",
		label: "Department",
		category: "details",
		directoryField: "organizations[primary].department",
		description: "Department on the user's primary organization",
		read: (person) => person.department,
	},
	{
		token: "workPhone",
		label: "Work phone",
		category: "details",
		directoryField: "phones[type=work]",
		description: "Work phone number on the Directory profile",
		read: (person) => phoneNumber(person, "work"),
	},
	{
		token: "homePhone",
		label: "Home phone",
		category: "details",
		directoryField: "phones[type=home]",
		description: "Home phone number on the Directory profile",
		read: (person) => phoneNumber(person, "home"),
	},
	{
		token: "mobile",
		label: "Mobile",
		category: "details",
		directoryField: "phones[type=mobile]",
		description: "Mobile phone number on the Directory profile",
		read: (person) => phoneNumber(person, "mobile"),
	},
	{
		token: "photoUrl",
		label: "Profile picture",
		category: "details",
		directoryField: "thumbnailPhotoUrl",
		description: "Directory thumbnail photo URL",
		read: (person) => person.photoUrl,
	},
	{
		token: "company",
		label: "Company name",
		category: "company",
		directoryField: "organizations[primary].name",
		description: "Name of the user's primary organization",
		read: (person) => person.organization,
	},
	{
		token: "costCenter",
		label: "Cost center",
		category: "company",
		directoryField: "organizations[primary].costCenter",
		description: "Cost center on the user's primary organization",
		read: (person) => person.costCenter,
	},
	{
		token: "companyLocation",
		label: "Location",
		category: "company",
		directoryField: "organizations[primary].location",
		description: "Location on the user's primary organization",
		read: (person) => person.location,
	},
	{
		token: "companyDescription",
		label: "Description",
		category: "company",
		directoryField: "organizations[primary].description",
		description: "Description on the user's primary organization",
		read: (person) => person.companyDescription,
	},
	{
		token: "companyDomain",
		label: "Domain",
		category: "company",
		directoryField: "primaryEmail domain",
		description: "Domain portion of the primary Workspace email",
		read: (person) => person.companyDomain,
	},
	{
		token: "managerEmail",
		label: "Manager",
		category: "company",
		directoryField: "relations[type=manager]",
		description: "Manager relation on the Directory profile",
		read: (person) => person.managerEmail,
	},
	{
		token: "buildingId",
		label: "Building",
		category: "company",
		directoryField: "locations[].buildingId",
		description: "Building ID from Directory locations",
		read: (person) => person.buildingId,
	},
	{
		token: "floorName",
		label: "Floor",
		category: "company",
		directoryField: "locations[].floorName",
		description: "Floor name from Directory locations",
		read: (person) => person.floorName,
	},
	{
		token: "floorSection",
		label: "Floor section",
		category: "company",
		directoryField: "locations[].floorSection",
		description: "Floor section from Directory locations",
		read: (person) => person.floorSection,
	},
	{
		token: "deskCode",
		label: "Desk",
		category: "company",
		directoryField: "locations[].deskCode",
		description: "Desk code from Directory locations",
		read: (person) => person.deskCode,
	},
	{
		token: "website",
		label: "Website",
		category: "social",
		directoryField: "websites[primary]",
		description: "Primary website on the Directory profile",
		read: (person) => person.website,
	},
	{
		token: "workWebsite",
		label: "Work website",
		category: "social",
		directoryField: "websites[type=work]",
		description: "Work website on the Directory profile",
		read: (person) => person.workWebsite,
	},
	{
		token: "homeWebsite",
		label: "Home website",
		category: "social",
		directoryField: "websites[type=home]",
		description: "Home website on the Directory profile",
		read: (person) => person.homeWebsite,
	},
	{
		token: "blog",
		label: "Blog",
		category: "social",
		directoryField: "websites[type=blog]",
		description: "Blog website on the Directory profile",
		read: (person) => person.blog,
	},
	{
		token: "profileUrl",
		label: "Profile",
		category: "social",
		directoryField: "websites[type=profile]",
		description: "Profile website on the Directory profile",
		read: (person) => person.profileUrl,
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

export function buildTemplateContext(person: Person): Record<string, string> {
	const values = {} as Record<PlaceholderToken, string>
	for(const placeholder of templatePlaceholders) {
		values[placeholder.token] = placeholder.read(person)
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

export function buildPreviewTemplateContext(): Record<string, string> {
	return buildTemplateContext(samplePerson)
}
