import { describe, expect, it } from "vitest"

import {
	listTemplateRecipientEmails,
	listWizardRecipientEmails,
} from "@/frontend/features/signatures/listTemplateRecipients"
import { directoryUsers } from "@/shared/directoryFixtures"
import { assignmentTypes } from "@/shared/template"

const jane = directoryUsers.find((user) => user.email === "jane.doe@example.com")
const alex = directoryUsers.find((user) => user.email === "alex.kim@example.com")
const sam = directoryUsers.find((user) => user.email === "sam.lee@example.com")
const morgan = directoryUsers.find((user) => user.email === "morgan.patel@example.com")

if(!jane || !alex || !sam || !morgan) throw new Error("Missing fixture users")

const templates = [
	{
		id: "person-template",
		isDefault: false,
		isActive: true,
		updatedAt: "2026-01-02T00:00:00.000Z",
	},
	{
		id: "group-template",
		isDefault: false,
		isActive: true,
		updatedAt: "2026-01-03T00:00:00.000Z",
	},
	{
		id: "ou-template",
		isDefault: false,
		isActive: true,
		updatedAt: "2026-01-04T00:00:00.000Z",
	},
	{
		id: "default-template",
		isDefault: true,
		isActive: true,
		updatedAt: "2026-01-01T00:00:00.000Z",
	},
]

const assignments = [
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
		templateId: "ou-template",
		assignmentType: assignmentTypes.organizationalUnit,
		targetId: "/Marketing",
		isActive: true,
	},
]

describe("listTemplateRecipientEmails", () => {
	it("lists people who win for a person assignment", () => {
		expect(listTemplateRecipientEmails(
			"person-template",
			templates,
			assignments,
			directoryUsers,
		)).toEqual([
			{ email: jane.email, displayName: jane.displayName },
		])
	})

	it("expands a group while respecting person overrides", () => {
		expect(listTemplateRecipientEmails(
			"group-template",
			templates,
			assignments,
			directoryUsers,
		)).toEqual([
			{ email: alex.email, displayName: alex.displayName },
		])
	})

	it("lists default recipients for unmatched mailboxes", () => {
		expect(listTemplateRecipientEmails(
			"default-template",
			templates,
			assignments,
			directoryUsers,
		)).toEqual([
			{ email: sam.email, displayName: sam.displayName },
		])
	})

	it("returns an empty list when nothing matches", () => {
		expect(listTemplateRecipientEmails(
			"missing-template",
			templates,
			assignments,
			directoryUsers,
		)).toEqual([])
	})
})

describe("listWizardRecipientEmails", () => {
	it("projects form targets as if the template were already saved", () => {
		const recipients = listWizardRecipientEmails(
			"draft-template",
			{
				isDefault: false,
				userEmails: [],
				groupIds: ["sales"],
				organizationalUnitPaths: [],
			},
			templates,
			assignments,
			directoryUsers,
		)

		expect(recipients).toEqual([
			{ email: sam.email, displayName: sam.displayName },
		])
	})

	it("replaces the editing template assignments instead of stacking them", () => {
		const recipients = listWizardRecipientEmails(
			"person-template",
			{
				isDefault: false,
				userEmails: [morgan.email],
				groupIds: [],
				organizationalUnitPaths: [],
			},
			templates,
			assignments,
			directoryUsers,
		)

		expect(recipients).toEqual([
			{ email: morgan.email, displayName: morgan.displayName },
		])
	})

	it("lists default recipients from the projected wizard state", () => {
		const recipients = listWizardRecipientEmails(
			"default-template",
			{
				isDefault: true,
				userEmails: [],
				groupIds: [],
				organizationalUnitPaths: [],
			},
			templates,
			assignments.filter((assignment) => assignment.templateId !== "default-template"),
			directoryUsers,
		)

		expect(recipients).toEqual([
			{ email: sam.email, displayName: sam.displayName },
		])
	})
})
