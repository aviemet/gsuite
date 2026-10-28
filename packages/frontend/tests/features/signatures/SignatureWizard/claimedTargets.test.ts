import { describe, expect, it } from "vitest"

import {
	assignmentTargetsForTemplate,
	buildClaimedTargets,
} from "@/frontend/features/signatures/SignatureWizard/claimedTargets"
import { getInitialWizardValues } from "@/frontend/features/signatures/SignatureWizard/types"
import { type Template, type TemplateAssignment } from "@/frontend/types/firebase"
import { assignmentTypes } from "@/shared/template"

const templates: Template[] = [
	{
		id: "template-a",
		name: "Engineering Sig",
		content: "<p>a</p>",
		variables: [],
		conditions: [],
		isDefault: false,
		isScheduled: false,
		createdBy: "admin",
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
		isActive: true,
		customerId: "customer-1",
	},
	{
		id: "template-b",
		name: "Default Sig",
		content: "<p>b</p>",
		variables: [],
		conditions: [],
		isDefault: true,
		isScheduled: false,
		createdBy: "admin",
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
		isActive: true,
		customerId: "customer-1",
	},
]

const assignments: TemplateAssignment[] = [
	{
		id: "assignment-1",
		templateId: "template-a",
		assignmentType: assignmentTypes.group,
		targetId: "engineering",
		priority: 0,
		createdBy: "admin",
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
		isActive: true,
		customerId: "customer-1",
	},
	{
		id: "assignment-2",
		templateId: "template-a",
		assignmentType: assignmentTypes.user,
		targetId: "jane.doe@example.com",
		priority: 1,
		createdBy: "admin",
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
		isActive: true,
		customerId: "customer-1",
	},
]

describe("buildClaimedTargets", () => {
	it("marks targets claimed by other templates and the rival default", () => {
		const claimed = buildClaimedTargets(assignments, templates, "template-new")

		expect(claimed.groups.get("engineering")).toEqual({
			templateId: "template-a",
			templateName: "Engineering Sig",
		})
		expect(claimed.users.get("jane.doe@example.com")?.templateName).toBe("Engineering Sig")
		expect(claimed.defaultTemplate).toEqual({
			templateId: "template-b",
			templateName: "Default Sig",
		})
	})

	it("excludes the current template's own claims", () => {
		const claimed = buildClaimedTargets(assignments, templates, "template-a")

		expect(claimed.groups.size).toBe(0)
		expect(claimed.users.size).toBe(0)
		expect(claimed.defaultTemplate?.templateId).toBe("template-b")
	})
})

describe("assignmentTargetsForTemplate", () => {
	it("collects people groups and OUs for one template", () => {
		expect(assignmentTargetsForTemplate(assignments, "template-a")).toEqual({
			userEmails: ["jane.doe@example.com"],
			groupIds: ["engineering"],
			organizationalUnitPaths: [],
		})
	})

	it("deduplicates repeated assignment rows", () => {
		expect(assignmentTargetsForTemplate([
			...assignments,
			{
				id: "assignment-dup",
				templateId: "template-a",
				assignmentType: assignmentTypes.group,
				targetId: "engineering",
				priority: 2,
				createdBy: "admin",
				createdAt: "2026-01-01T00:00:00.000Z",
				updatedAt: "2026-01-01T00:00:00.000Z",
				isActive: true,
				customerId: "customer-1",
			},
		], "template-a").groupIds).toEqual(["engineering"])
	})
})

describe("getInitialWizardValues", () => {
	it("hydrates targets and default from template assignments", () => {
		const values = getInitialWizardValues(templates[0], assignments)

		expect(values.isDefault).toBe(false)
		expect(values.userEmails).toEqual(["jane.doe@example.com"])
		expect(values.groupIds).toEqual(["engineering"])
		expect(values.organizationalUnitPaths).toEqual([])
	})

	it("hydrates default from the template flag", () => {
		expect(getInitialWizardValues(templates[1], []).isDefault).toBe(true)
	})
})
