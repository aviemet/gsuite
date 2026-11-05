import { describe, expect, it } from "vitest"

import { canDeployTemplate } from "@/frontend/features/signatures/canDeployTemplate"
import { assignmentTypes } from "@/shared/template"

describe("canDeployTemplate", () => {
	it("allows a fallback template with no targets", () => {
		expect(canDeployTemplate(
			{ isDefault: true },
			[],
			"template-1",
		)).toBe(true)
	})

	it("allows a template with an active target", () => {
		expect(canDeployTemplate(
			{ isDefault: false },
			[{
				templateId: "template-1",
				assignmentType: assignmentTypes.group,
				isActive: true,
			}],
			"template-1",
		)).toBe(true)
	})

	it("blocks a template with no fallback and no targets", () => {
		expect(canDeployTemplate(
			{ isDefault: false },
			[],
			"template-1",
		)).toBe(false)
	})
})
