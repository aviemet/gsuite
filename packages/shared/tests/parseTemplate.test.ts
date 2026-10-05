import { describe, expect, it } from "vitest"

import { resolveTargetEmails } from "../src/directoryFixtures"
import { extractTemplateVariables, safeTemplateParse } from "../src/parseTemplate"

describe("safeTemplateParse", () => {
	it("fills values and conditionals", () => {
		const html = safeTemplateParse(
			"<p>{{fullName}}</p>{{#if jobTitle}}<p>{{jobTitle}}</p>{{/if}}",
			{ fullName: "Jane Doe", jobTitle: "PM" },
		)
		expect(html).toContain("Jane Doe")
		expect(html).toContain("PM")
	})
})

describe("extractTemplateVariables", () => {
	it("collects unique tokens", () => {
		expect(extractTemplateVariables("{{fullName}} {{email}} {{fullName}}")).toEqual([
			"fullName",
			"email",
		])
	})
})

describe("resolveTargetEmails", () => {
	it("expands groups and organizational units without duplicates", () => {
		const emails = resolveTargetEmails({
			userEmails: ["jane.doe@example.com"],
			groupIds: ["marketing"],
			organizationalUnitPaths: ["/Engineering/Platform"],
		})
		expect(emails).toEqual([
			"alex.kim@example.com",
			"jane.doe@example.com",
			"morgan.patel@example.com",
		])
	})
})
