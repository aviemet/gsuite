import { assignmentTypes } from "@gsuite/shared"
import { describe, expect, it } from "vitest"

import {
	readAssignmentTemplateId,
	readResolvableAssignments,
	readResolvableTemplates,
	readScheduledTemplateIds,
} from "../src/signatures/readSignatureRecords"

function document(id: string, data: unknown) {
	return {
		id,
		data: () => data,
	}
}

describe("readResolvableTemplates", () => {
	it("treats a missing isActive flag as active and ignores non-boolean defaults", () => {
		const templates = readResolvableTemplates([
			document("template-1", { updatedAt: "2026-01-01T00:00:00.000Z" }),
			document("template-2", { isActive: false, isDefault: "yes", updatedAt: 12 }),
			document("template-3", null),
		])

		expect(templates).toEqual([
			{
				id: "template-1",
				isDefault: false,
				isActive: true,
				updatedAt: "2026-01-01T00:00:00.000Z",
			},
			{
				id: "template-2",
				isDefault: false,
				isActive: false,
				updatedAt: "",
			},
		])
	})
})

describe("readScheduledTemplateIds", () => {
	it("keeps active templates that are marked scheduled", () => {
		const templateIds = readScheduledTemplateIds([
			document("scheduled", { isScheduled: true }),
			document("inactive", { isScheduled: true, isActive: false }),
			document("manual", { isScheduled: false, isActive: true }),
		])

		expect([...templateIds]).toEqual(["scheduled"])
	})
})

describe("readResolvableAssignments", () => {
	it("skips documents whose assignment type is not a known type", () => {
		const assignments = readResolvableAssignments([
			{
				data: () => ({
					templateId: "template-1",
					assignmentType: assignmentTypes.user,
					targetId: "ada@example.com",
					isActive: true,
				}),
			},
			{
				data: () => ({
					templateId: "template-1",
					assignmentType: "office",
					targetId: "ignored",
				}),
			},
			{
				data: () => ({
					templateId: "template-2",
					assignmentType: assignmentTypes.group,
					targetId: "engineering",
					isActive: false,
				}),
			},
		])

		expect(assignments).toEqual([
			{
				templateId: "template-1",
				assignmentType: assignmentTypes.user,
				targetId: "ada@example.com",
				isActive: true,
			},
			{
				templateId: "template-2",
				assignmentType: assignmentTypes.group,
				targetId: "engineering",
				isActive: false,
			},
		])
	})
})

describe("readAssignmentTemplateId", () => {
	it("returns the template id stored on an assignment document", () => {
		expect(readAssignmentTemplateId({ templateId: "template-1" })).toBe("template-1")
		expect(readAssignmentTemplateId({ templateId: 4 })).toBe("")
		expect(readAssignmentTemplateId(null)).toBe("")
	})
})
