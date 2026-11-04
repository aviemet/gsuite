import { describe, expect, it } from "vitest"

import { getPersonForEmail, personFromDirectoryUser } from "../src/targets/people"

describe("personFromDirectoryUser", () => {
	it("maps Directory profile fields without sample fixture values", () => {
		const person = personFromDirectoryUser({
			email: "avram@thebatterysf.com",
			displayName: "Avram Walden",
			givenName: "Avram",
			familyName: "Walden",
			signatureHtml: "",
			groupIds: [],
			organizationalUnitPaths: ["/"],
			jobTitle: "Engineering Manager",
			department: "IT",
			organization: "The Battery",
			location: "San Francisco",
			employeeId: "42",
			address: "1 Main St",
			photoUrl: "",
			costCenter: "",
			companyDescription: "",
			managerEmail: "boss@thebatterysf.com",
			buildingId: "",
			floorName: "",
			floorSection: "",
			deskCode: "",
			website: "",
			workWebsite: "",
			homeWebsite: "",
			blog: "",
			profileUrl: "",
			phoneNumbers: [{ type: "work", number: "+1-415-555-0100" }],
		})

		expect(person.displayName).toBe("Avram Walden")
		expect(person.jobTitle).toBe("Engineering Manager")
		expect(person.phoneNumbers).toEqual([{ type: "work", number: "+1-415-555-0100" }])
		expect(person.companyDomain).toBe("thebatterysf.com")
		expect(person.jobTitle).not.toBe("Product Manager")
	})
})

describe("getPersonForEmail", () => {
	it("returns empty profile fields when the user is missing from Directory", () => {
		const person = getPersonForEmail("nobody@example.com", new Map())

		expect(person.primaryEmail).toBe("nobody@example.com")
		expect(person.jobTitle).toBe("")
		expect(person.phoneNumbers).toEqual([])
	})
})
