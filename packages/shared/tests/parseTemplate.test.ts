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

	it("renders the if branch when the value is present", () => {
		const html = safeTemplateParse(
			"{{#if mobile}}{{mobile}}{{else}}555-0100{{/if}}",
			{ mobile: "555-0199" },
		)
		expect(html).toBe("555-0199")
	})

	it("renders the else branch when the value is missing", () => {
		const html = safeTemplateParse(
			"{{#if mobile}}{{mobile}}{{ else }}555-0100{{/if}}",
			{ mobile: "" },
		)
		expect(html).toBe("555-0100")
	})

	it("handles separate if/else blocks independently", () => {
		const html = safeTemplateParse(
			"{{#if mobile}}{{mobile}}{{else}}main{{/if}}|{{#if email}}{{email}}{{else}}none{{/if}}",
			{ mobile: "", email: "jane@example.com" },
		)
		expect(html).toBe("main|jane@example.com")
	})
})

describe("extractTemplateVariables", () => {
	it("collects unique tokens", () => {
		expect(extractTemplateVariables("{{fullName}} {{email}} {{fullName}}")).toEqual([
			"fullName",
			"email",
		])
	})

	it("does not treat else as a variable", () => {
		expect(extractTemplateVariables("{{#if mobile}}{{mobile}}{{else}}{{workPhone}}{{/if}}")).toEqual([
			"mobile",
			"workPhone",
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
