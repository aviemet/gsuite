import { describe, expect, it } from "vitest"

import { directoryUsers } from "../src/directoryFixtures"
import {
	groupEmailsByResolvedTemplate,
	type ResolvableAssignment,
	type ResolvableTemplate,
	resolveSignatureTemplateForUser,
} from "../src/resolveSignatureTemplateForUser"
import { assignmentTypes } from "../src/template"

const jane = directoryUsers.find((user) => user.email === "jane.doe@example.com")
const alex = directoryUsers.find((user) => user.email === "alex.kim@example.com")
const sam = directoryUsers.find((user) => user.email === "sam.lee@example.com")

if(!jane || !alex || !sam) throw new Error("Missing fixture users")

const templates: ResolvableTemplate[] = [
	{ id: "person-template", isDefault: false, isActive: true, updatedAt: "2026-01-02T00:00:00.000Z" },
	{ id: "group-template", isDefault: false, isActive: true, updatedAt: "2026-01-03T00:00:00.000Z" },
	{ id: "ou-shallow", isDefault: false, isActive: true, updatedAt: "2026-01-04T00:00:00.000Z" },
	{ id: "ou-deep", isDefault: false, isActive: true, updatedAt: "2026-01-01T00:00:00.000Z" },
	{ id: "default-template", isDefault: true, isActive: true, updatedAt: "2026-01-01T00:00:00.000Z" },
]

describe("resolveSignatureTemplateForUser", () => {
	it("prefers person over group over OU over default", () => {
		const assignments: ResolvableAssignment[] = [
			{
				templateId: "person-template",
				assignmentType: assignmentTypes.user,
				targetId: jane.email,
				isActive: true,
			},
			{
				templateId: "group-template",
				assignmentType: assignmentTypes.group,
				targetId: "engineering",
				isActive: true,
			},
			{
				templateId: "ou-shallow",
				assignmentType: assignmentTypes.organizationalUnit,
				targetId: "/Engineering",
				isActive: true,
			},
		]

		expect(resolveSignatureTemplateForUser(jane, templates, assignments)).toBe("person-template")

		const withoutPerson = assignments.filter(
			(assignment) => assignment.assignmentType !== assignmentTypes.user,
		)
		expect(resolveSignatureTemplateForUser(jane, templates, withoutPerson)).toBe("group-template")

		const ouOnly = withoutPerson.filter(
			(assignment) => assignment.assignmentType !== assignmentTypes.group,
		)
		expect(resolveSignatureTemplateForUser(jane, templates, ouOnly)).toBe("ou-shallow")
		expect(resolveSignatureTemplateForUser(jane, templates, [])).toBe("default-template")
	})

	it("prefers the deepest matching OU path", () => {
		const assignments: ResolvableAssignment[] = [
			{
				templateId: "ou-shallow",
				assignmentType: assignmentTypes.organizationalUnit,
				targetId: "/Engineering",
				isActive: true,
			},
			{
				templateId: "ou-deep",
				assignmentType: assignmentTypes.organizationalUnit,
				targetId: "/Engineering/Platform",
				isActive: true,
			},
		]

		expect(resolveSignatureTemplateForUser(alex, templates, assignments)).toBe("ou-deep")
	})

	it("breaks same-type ties with most recently updated template", () => {
		const newerGroup: ResolvableTemplate = {
			id: "group-newer",
			isDefault: false,
			isActive: true,
			updatedAt: "2026-02-01T00:00:00.000Z",
		}
		const assignments: ResolvableAssignment[] = [
			{
				templateId: "group-template",
				assignmentType: assignmentTypes.group,
				targetId: "engineering",
				isActive: true,
			},
			{
				templateId: "group-newer",
				assignmentType: assignmentTypes.group,
				targetId: "product",
				isActive: true,
			},
		]

		expect(resolveSignatureTemplateForUser(
			jane,
			[...templates, newerGroup],
			assignments,
		)).toBe("group-newer")
	})

	it("returns null when nothing matches", () => {
		expect(resolveSignatureTemplateForUser(sam, [], [])).toBeNull()
	})
})

describe("groupEmailsByResolvedTemplate", () => {
	it("groups emails by winning template", () => {
		const assignments: ResolvableAssignment[] = [
			{
				templateId: "person-template",
				assignmentType: assignmentTypes.user,
				targetId: jane.email,
				isActive: true,
			},
			{
				templateId: "group-template",
				assignmentType: assignmentTypes.group,
				targetId: "engineering",
				isActive: true,
			},
		]

		const grouped = groupEmailsByResolvedTemplate(
			[jane.email, alex.email, sam.email],
			directoryUsers,
			templates,
			assignments,
		)

		expect(grouped.get("person-template")).toEqual([jane.email])
		expect(grouped.get("group-template")).toEqual([alex.email])
		expect(grouped.get("default-template")).toEqual([sam.email])
	})
})
