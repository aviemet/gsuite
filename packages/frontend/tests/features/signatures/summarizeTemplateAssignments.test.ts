import { describe, expect, it } from "vitest"

import { summarizeTemplateAssignments } from "@/frontend/features/signatures/summarizeTemplateAssignments"
import { type TemplateAssignment } from "@/frontend/types/firebase"
import { directoryGroups, directoryOrganizationalUnits, directoryUsers } from "@/shared/directoryFixtures"
import { assignmentTypes } from "@/shared/template"

const directory = {
	users: directoryUsers,
	groups: directoryGroups,
	organizationalUnits: directoryOrganizationalUnits,
}

function assignment(
	overrides: Partial<TemplateAssignment> & Pick<TemplateAssignment, "assignmentType" | "targetId">,
): TemplateAssignment {
	return {
		id: overrides.id ?? "assignment-1",
		templateId: overrides.templateId ?? "template-1",
		assignmentType: overrides.assignmentType,
		targetId: overrides.targetId,
		priority: overrides.priority ?? 0,
		createdBy: overrides.createdBy ?? "admin",
		createdAt: overrides.createdAt ?? "2026-01-01T00:00:00.000Z",
		updatedAt: overrides.updatedAt ?? "2026-01-01T00:00:00.000Z",
		isActive: overrides.isActive ?? true,
		customerId: overrides.customerId ?? "customer-1",
	}
}

describe("summarizeTemplateAssignments", () => {
	it("returns Default for the default template", () => {
		expect(summarizeTemplateAssignments(
			{ id: "template-1", isDefault: true },
			[],
		)).toEqual({
			text: "Default",
			details: [],
			hasDetailTooltip: false,
		})
	})

	it("returns Unassigned when there are no active assignments", () => {
		expect(summarizeTemplateAssignments(
			{ id: "template-1", isDefault: false },
			[assignment({
				assignmentType: assignmentTypes.group,
				targetId: "engineering",
				isActive: false,
			})],
		)).toEqual({
			text: "Unassigned",
			details: [],
			hasDetailTooltip: false,
		})
	})

	it("names a single group from the directory without a tooltip", () => {
		expect(summarizeTemplateAssignments(
			{ id: "template-1", isDefault: false },
			[assignment({ assignmentType: assignmentTypes.group, targetId: "engineering" })],
			directory,
		)).toEqual({
			text: "Engineering",
			details: [{ kind: "group", label: "Engineering" }],
			hasDetailTooltip: false,
		})
	})

	it("counts multiple groups and exposes detail labels for a tooltip", () => {
		expect(summarizeTemplateAssignments(
			{ id: "template-1", isDefault: false },
			[
				assignment({
					id: "a",
					assignmentType: assignmentTypes.group,
					targetId: "engineering",
				}),
				assignment({
					id: "b",
					assignmentType: assignmentTypes.group,
					targetId: "product",
				}),
				assignment({
					id: "c",
					assignmentType: assignmentTypes.group,
					targetId: "marketing",
				}),
			],
			directory,
		)).toEqual({
			text: "3 groups",
			details: [
				{ kind: "group", label: "Engineering" },
				{ kind: "group", label: "Product" },
				{ kind: "group", label: "Marketing" },
			],
			hasDetailTooltip: true,
		})
	})

	it("summarizes mixed assignment types with tooltip details", () => {
		expect(summarizeTemplateAssignments(
			{ id: "template-1", isDefault: false },
			[
				assignment({
					id: "a",
					assignmentType: assignmentTypes.organizationalUnit,
					targetId: "/Engineering",
				}),
				assignment({
					id: "b",
					assignmentType: assignmentTypes.group,
					targetId: "engineering",
				}),
				assignment({
					id: "c",
					assignmentType: assignmentTypes.user,
					targetId: "jane.doe@example.com",
				}),
			],
			directory,
		)).toEqual({
			text: "1 organizational unit, 1 group, 1 person",
			details: [
				{ kind: "organizationalUnit", label: "/Engineering" },
				{ kind: "group", label: "Engineering" },
				{ kind: "user", label: "Jane Doe" },
			],
			hasDetailTooltip: true,
		})
	})
})
