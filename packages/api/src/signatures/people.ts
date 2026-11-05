import { type DirectoryUser, emptyDirectoryProfile, type Person } from "@gsuite/shared"

function companyDomainFromEmail(email: string): string {
	const at = email.lastIndexOf("@")
	if(at < 0) return ""
	return email.slice(at + 1).toLowerCase()
}

export function personFromDirectoryUser(user: DirectoryUser): Person {
	const displayName = user.displayName || user.email
	const givenName = user.givenName.trim()
	const familyName = user.familyName.trim()
	const [fallbackFirst = displayName, ...fallbackRest] = displayName.split(" ")

	return {
		id: user.email,
		firstName: givenName || fallbackFirst,
		lastName: familyName || fallbackRest.join(" "),
		displayName,
		primaryEmail: user.email,
		alternateEmails: [],
		phoneNumbers: user.phoneNumbers.map((phone) => ({
			type: phone.type,
			number: phone.number,
		})),
		jobTitle: user.jobTitle,
		department: user.department,
		organization: user.organization,
		location: user.location,
		employeeId: user.employeeId,
		address: user.address,
		photoUrl: user.photoUrl,
		costCenter: user.costCenter,
		companyDescription: user.companyDescription,
		companyDomain: companyDomainFromEmail(user.email),
		managerEmail: user.managerEmail,
		buildingId: user.buildingId,
		floorName: user.floorName,
		floorSection: user.floorSection,
		deskCode: user.deskCode,
		website: user.website,
		workWebsite: user.workWebsite,
		homeWebsite: user.homeWebsite,
		blog: user.blog,
		profileUrl: user.profileUrl,
	}
}

export function getPersonForEmail(
	email: string,
	usersByEmail: ReadonlyMap<string, DirectoryUser>,
): Person {
	const directoryUser = usersByEmail.get(email)
	if(directoryUser) {
		return personFromDirectoryUser(directoryUser)
	}

	return personFromDirectoryUser({
		...emptyDirectoryProfile(),
		email,
		displayName: email,
		signatureHtml: "",
		groupIds: [],
		organizationalUnitPaths: ["/"],
	})
}
