import { describe, expect, it } from "vitest"

import {
	findConflictingAssignments,
	proposedTargetsFromRequest,
} from "../src/findConflictingAssignments"
import { assignmentTypes } from "../src/template"

describe("findConflictingAssignments", () => {
	it("returns conflicts for targets claimed by another template", () => {
		const conflicts = findConflictingAssignments(
			[
				{
					assignmentType: assignmentTypes.group,
					targetId: "engineering",
					templateId: "template-a",
					isActive: true,
				},
				{
					assignmentType: assignmentTypes.user,
					targetId: "jane.doe@example.com",
					templateId: "template-a",
					isActive: true,
				},
			],
			[
				{ assignmentType: assignmentTypes.group, targetId: "engineering" },
				{ assignmentType: assignmentTypes.group, targetId: "marketing" },
				{ assignmentType: assignmentTypes.user, targetId: "sam.lee@example.com" },
			],
			"template-b",
		)

		expect(conflicts).toEqual([
			{
				assignmentType: assignmentTypes.group,
				targetId: "engineering",
				templateId: "template-a",
			},
		])
	})

	it("ignores claims belonging to the current template", () => {
		const conflicts = findConflictingAssignments(
			[
				{
					assignmentType: assignmentTypes.organizationalUnit,
					targetId: "/Engineering",
					templateId: "template-a",
					isActive: true,
				},
			],
			[{ assignmentType: assignmentTypes.organizationalUnit, targetId: "/Engineering" }],
			"template-a",
		)

		expect(conflicts).toEqual([])
	})

	it("ignores inactive assignments", () => {
		const conflicts = findConflictingAssignments(
			[
				{
					assignmentType: assignmentTypes.group,
					targetId: "engineering",
					templateId: "template-a",
					isActive: false,
				},
			],
			[{ assignmentType: assignmentTypes.group, targetId: "engineering" }],
			"template-b",
		)

		expect(conflicts).toEqual([])
	})
})

describe("proposedTargetsFromRequest", () => {
	it("maps request fields to assignment targets", () => {
		expect(proposedTargetsFromRequest({
			userEmails: ["jane.doe@example.com"],
			groupIds: ["engineering"],
			organizationalUnitPaths: ["/Sales"],
		})).toEqual([
			{ assignmentType: assignmentTypes.user, targetId: "jane.doe@example.com" },
			{ assignmentType: assignmentTypes.group, targetId: "engineering" },
			{ assignmentType: assignmentTypes.organizationalUnit, targetId: "/Sales" },
		])
	})
})
