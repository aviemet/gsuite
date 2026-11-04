import { describe, expect, it } from "vitest"

import { samplePerson } from "../src/person.testdata"
import {
	buildPreviewTemplateContext,
	buildTemplateContext,
	templatePlaceholders,
} from "../src/templatePlaceholders"

describe("templatePlaceholders registry", () => {
	it("registers unique tokens for every signature variable", () => {
		const tokens = templatePlaceholders.map((placeholder) => placeholder.token)
		expect(new Set(tokens).size).toBe(tokens.length)
		expect(tokens.length).toBeGreaterThan(20)
	})

	it("builds deploy context only from the provided Directory person", () => {
		const person = {
			id: "avram@thebatterysf.com",
			firstName: "Avram",
			lastName: "Walden",
			displayName: "Avram Walden",
			primaryEmail: "avram@thebatterysf.com",
			alternateEmails: [],
			phoneNumbers: [{ type: "work" as const, number: "+1-415-555-0100" }],
			jobTitle: "Engineering Manager",
			department: "IT",
			organization: "The Battery",
			location: "",
			employeeId: "",
			address: "",
			photoUrl: "",
			costCenter: "",
			companyDescription: "",
			companyDomain: "thebatterysf.com",
			managerEmail: "",
			buildingId: "",
			floorName: "",
			floorSection: "",
			deskCode: "",
			website: "",
			workWebsite: "",
			homeWebsite: "",
			blog: "",
			profileUrl: "",
		}

		const context = buildTemplateContext(person)

		expect(context.fullName).toBe("Avram Walden")
		expect(context.jobTitle).toBe("Engineering Manager")
		expect(context.workPhone).toBe("+1-415-555-0100")
		expect(context.jobTitle).not.toBe(samplePerson.jobTitle)
		expect(context.workPhone).not.toBe(
			samplePerson.phoneNumbers.find((phone) => phone.type === "work")?.number,
		)
	})

	it("leaves missing Directory fields blank instead of substituting preview data", () => {
		const context = buildTemplateContext({
			id: "nobody@example.com",
			firstName: "Nobody",
			lastName: "",
			displayName: "Nobody",
			primaryEmail: "nobody@example.com",
			alternateEmails: [],
			phoneNumbers: [],
			jobTitle: "",
			department: "",
			organization: "",
			location: "",
			employeeId: "",
			address: "",
			photoUrl: "",
			costCenter: "",
			companyDescription: "",
			companyDomain: "example.com",
			managerEmail: "",
			buildingId: "",
			floorName: "",
			floorSection: "",
			deskCode: "",
			website: "",
			workWebsite: "",
			homeWebsite: "",
			blog: "",
			profileUrl: "",
		})

		expect(context.jobTitle).toBe("")
		expect(context.workPhone).toBe("")
		expect(context.mobile).toBe("")
		expect(Object.values(context).some((value) => value.includes("Product Manager"))).toBe(false)
		expect(Object.values(context).some((value) => value.includes("555-987"))).toBe(false)
	})

	it("uses the dummy person only through buildPreviewTemplateContext", () => {
		const context = buildPreviewTemplateContext()
		expect(context.jobTitle).toBe(samplePerson.jobTitle)
		expect(context.workPhone).toBe(
			samplePerson.phoneNumbers.find((phone) => phone.type === "work")?.number,
		)
	})
})
