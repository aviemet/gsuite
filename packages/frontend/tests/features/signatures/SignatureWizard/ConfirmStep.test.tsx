import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import "@testing-library/jest-dom/vitest"

import { ConfirmStep } from "@/frontend/features/signatures/SignatureWizard/ConfirmStep"
import { type SignatureWizardValues } from "@/frontend/features/signatures/SignatureWizard/types"
import { theme } from "@/frontend/lib/theme"
import { directoryGroups, directoryOrganizationalUnits, directoryUsers } from "@/shared/directoryFixtures"
import { assignmentTypes } from "@/shared/template"

afterEach(() => {
	cleanup()
})

const values: SignatureWizardValues = {
	setupSource: "blank",
	sourceTemplateId: null,
	sourceAccountEmail: null,
	name: "Sales Signature",
	content: "<p>{{fullName}}</p>",
	isDefault: false,
	userEmails: [],
	groupIds: ["sales"],
	organizationalUnitPaths: [],
	isScheduled: false,
}

describe("ConfirmStep", () => {
	it("lists resolved recipients for the projected wizard targets", () => {
		render(
			<MantineProvider theme={ theme }>
				<ConfirmStep
					templateId="draft-template"
					values={ values }
					templates={ [] }
					assignments={ [] }
					directory={ {
						users: directoryUsers,
						groups: directoryGroups,
						organizationalUnits: directoryOrganizationalUnits,
					} }
				/>
			</MantineProvider>,
		)

		expect(screen.getByText("These mailboxes will receive this signature when you save.")).toBeInTheDocument()
		expect(screen.getByText("Will apply to 1 mailbox")).toBeInTheDocument()
		expect(screen.getByText("Sam Lee")).toBeInTheDocument()
		expect(screen.getByText("(sam.lee@example.com)")).toBeInTheDocument()
		expect(screen.getByText("Sales")).toBeInTheDocument()
	})

	it("keeps person overrides when projecting against existing assignments", () => {
		render(
			<MantineProvider theme={ theme }>
				<ConfirmStep
					templateId="group-template"
					values={ {
						...values,
						name: "Engineering Signature",
						groupIds: ["engineering"],
					} }
					templates={ [
						{
							id: "person-template",
							name: "Person Signature",
							content: "<p>Person</p>",
							variables: [],
							conditions: [],
							isDefault: false,
							isActive: true,
							createdBy: "admin",
							createdAt: "2026-01-01T00:00:00.000Z",
							updatedAt: "2026-01-02T00:00:00.000Z",
							customerId: "customer-1",
						},
						{
							id: "group-template",
							name: "Engineering Signature",
							content: "<p>Group</p>",
							variables: [],
							conditions: [],
							isDefault: false,
							isActive: true,
							createdBy: "admin",
							createdAt: "2026-01-01T00:00:00.000Z",
							updatedAt: "2026-01-03T00:00:00.000Z",
							customerId: "customer-1",
						},
					] }
					assignments={ [
						{
							id: "assignment-1",
							templateId: "person-template",
							assignmentType: assignmentTypes.user,
							targetId: "jane.doe@example.com",
							priority: 0,
							createdBy: "admin",
							createdAt: "2026-01-01T00:00:00.000Z",
							updatedAt: "2026-01-01T00:00:00.000Z",
							isActive: true,
							customerId: "customer-1",
						},
					] }
					directory={ {
						users: directoryUsers,
						groups: directoryGroups,
						organizationalUnits: directoryOrganizationalUnits,
					} }
				/>
			</MantineProvider>,
		)

		expect(screen.getByText("Will apply to 1 mailbox")).toBeInTheDocument()
		expect(screen.getByText("Alex Kim")).toBeInTheDocument()
		expect(screen.getByText("(alex.kim@example.com)")).toBeInTheDocument()
		expect(screen.queryByText("(jane.doe@example.com)")).not.toBeInTheDocument()
	})
})
