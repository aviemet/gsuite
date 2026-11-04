import { type DirectoryPhoneNumber, emptyDirectoryProfile } from "@gsuite/shared"

export interface GoogleDirectoryUserLike {
	primaryEmail?: string | null
	name?: {
		fullName?: string | null
		givenName?: string | null
		familyName?: string | null
	} | null
	orgUnitPath?: string | null
	thumbnailPhotoUrl?: string | null
	organizations?: Array<{
		primary?: boolean | null
		title?: string | null
		department?: string | null
		name?: string | null
		description?: string | null
		costCenter?: string | null
		location?: string | null
	}> | null
	phones?: Array<{
		type?: string | null
		value?: string | null
		primary?: boolean | null
	}> | null
	addresses?: Array<{
		type?: string | null
		formatted?: string | null
		primary?: boolean | null
	}> | null
	externalIds?: Array<{
		type?: string | null
		value?: string | null
	}> | null
	relations?: Array<{
		type?: string | null
		value?: string | null
	}> | null
	locations?: Array<{
		buildingId?: string | null
		floorName?: string | null
		floorSection?: string | null
		deskCode?: string | null
	}> | null
	websites?: Array<{
		type?: string | null
		value?: string | null
		primary?: boolean | null
	}> | null
}

function text(value: string | null | undefined): string {
	return value?.trim() ?? ""
}

function primaryOrganization(user: GoogleDirectoryUserLike) {
	const organizations = user.organizations ?? []
	return organizations.find((entry) => entry.primary) ?? organizations[0]
}

function mapPhoneType(type: string | null | undefined): DirectoryPhoneNumber["type"] | undefined {
	const normalized = text(type).toLowerCase()
	if(!normalized) return undefined
	if(normalized.includes("mobile") || normalized.includes("cell")) return "mobile"
	if(normalized.includes("home")) return "home"
	if(normalized.includes("work") || normalized.includes("business")) return "work"
	return undefined
}

function mapPhoneNumbers(user: GoogleDirectoryUserLike): DirectoryPhoneNumber[] {
	const phones: DirectoryPhoneNumber[] = []
	for(const phone of user.phones ?? []) {
		const number = text(phone.value)
		const mappedType = mapPhoneType(phone.type)
		if(!number || !mappedType) continue
		phones.push({ type: mappedType, number })
	}
	return phones
}

function websiteByType(user: GoogleDirectoryUserLike, type: string): string {
	const match = (user.websites ?? []).find((entry) => text(entry.type).toLowerCase() === type)
	return text(match?.value)
}

export function mapDirectoryUserProfile(user: GoogleDirectoryUserLike) {
	const organization = primaryOrganization(user)
	const address = (user.addresses ?? []).find((entry) => entry.primary)
		?? (user.addresses ?? [])[0]
	const employeeId = (user.externalIds ?? []).find((entry) => {
		const type = text(entry.type).toLowerCase()
		return type === "organization" || type === "employee" || type === "employee_id"
	})
	const manager = (user.relations ?? []).find((entry) => text(entry.type).toLowerCase() === "manager")
	const location = (user.locations ?? [])[0]
	const empty = emptyDirectoryProfile()

	return {
		...empty,
		givenName: text(user.name?.givenName),
		familyName: text(user.name?.familyName),
		jobTitle: text(organization?.title),
		department: text(organization?.department),
		organization: text(organization?.name),
		location: text(organization?.location) || text(location?.buildingId),
		employeeId: text(employeeId?.value),
		address: text(address?.formatted),
		photoUrl: text(user.thumbnailPhotoUrl),
		costCenter: text(organization?.costCenter),
		companyDescription: text(organization?.description),
		managerEmail: text(manager?.value).toLowerCase(),
		buildingId: text(location?.buildingId),
		floorName: text(location?.floorName),
		floorSection: text(location?.floorSection),
		deskCode: text(location?.deskCode),
		website: websiteByType(user, "work") || text((user.websites ?? [])[0]?.value),
		workWebsite: websiteByType(user, "work"),
		homeWebsite: websiteByType(user, "home"),
		blog: websiteByType(user, "blog"),
		profileUrl: websiteByType(user, "profile"),
		phoneNumbers: mapPhoneNumbers(user),
	}
}
