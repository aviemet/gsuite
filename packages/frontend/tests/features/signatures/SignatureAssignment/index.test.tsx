import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { SignatureAssignment } from "@/frontend/features/signatures/SignatureAssignment"
import { theme } from "@/frontend/lib/theme"
import { type Template, type TemplateAssignment } from "@/frontend/types/firebase"
import { directoryGroups, directoryOrganizationalUnits, directoryUsers } from "@/shared/directoryFixtures"
import { assignmentTypes } from "@/shared/template"

const template: Template = {
	id: "template-1",
	name: "Sales Signature",
	content: "<p>{{fullName}}</p>",
	variables: [],
	conditions: [],
	isDefault: false,
	isScheduled: false,
	createdBy: "admin",
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
	isActive: true,
	customerId: "customer-1",
}

const assignments: TemplateAssignment[] = [
	{
		id: "assignment-1",
		templateId: "template-1",
		assignmentType: assignmentTypes.group,
		targetId: "sales",
		priority: 0,
		createdBy: "admin",
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
		isActive: true,
		customerId: "customer-1",
	},
]

vi.mock("@/frontend/queries/templates", () => ({
	useTemplateQuery: () => ({ data: template, isLoading: false }),
	useTemplatesQuery: () => ({ data: [template] }),
	useTemplateAssignmentsQuery: () => ({ data: assignments, isLoading: false }),
}))

vi.mock("@/frontend/queries/directory", () => ({
	useDirectoryQuery: () => ({
		data: {
			users: directoryUsers,
			groups: directoryGroups,
			organizationalUnits: directoryOrganizationalUnits,
		},
		isLoading: false,
		error: null,
	}),
}))

afterEach(() => {
	cleanup()
})

describe("SignatureAssignment", () => {
	it("saves the policy without applying it", async () => {
		const user = userEvent.setup({
			pointerEventsCheck: PointerEventsCheckLevel.Never,
		})
		const onSave = vi.fn()
		const onApply = vi.fn()

		render(
			<MantineProvider theme={ theme }>
				<SignatureAssignment
					templateId="template-1"
					onSave={ onSave }
					onApply={ onApply }
					onCancel={ vi.fn() }
				/>
			</MantineProvider>,
		)

		expect(screen.getByText("Sam Lee")).toBeInTheDocument()
		const applyButton = screen.getByRole("button", { name: "Apply" })
		await user.click(applyButton)
		expect(applyButton).toHaveAttribute("aria-expanded", "true")
		await user.click(await screen.findByRole("menuitem", { name: /Mailboxes are not updated/, hidden: true }))

		expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
			groupIds: ["sales"],
			isDefault: false,
			isScheduled: false,
		}))
		expect(onApply).not.toHaveBeenCalled()
	})

	it("applies only after the recipient confirmation", async () => {
		const user = userEvent.setup({
			pointerEventsCheck: PointerEventsCheckLevel.Never,
		})
		const onSave = vi.fn()
		const onApply = vi.fn()

		render(
			<MantineProvider theme={ theme }>
				<SignatureAssignment
					templateId="template-1"
					onSave={ onSave }
					onApply={ onApply }
					onCancel={ vi.fn() }
				/>
			</MantineProvider>,
		)

		await user.click(screen.getByRole("button", { name: "Apply" }))
		expect(onApply).not.toHaveBeenCalled()
		expect(screen.queryByRole("dialog", { name: "Deploy Sales Signature?" })).not.toBeInTheDocument()

		await user.click(await screen.findByRole("menuitem", { name: /update the matched mailboxes/, hidden: true }))
		expect(await screen.findByRole("dialog", { name: "Deploy Sales Signature?" })).toBeInTheDocument()

		await user.click(screen.getByRole("button", { name: "Deploy" }))
		expect(onApply).toHaveBeenCalledOnce()
		expect(onSave).not.toHaveBeenCalled()
	})

	it("cancels without saving or applying", async () => {
		const user = userEvent.setup()
		const onSave = vi.fn()
		const onApply = vi.fn()
		const onCancel = vi.fn()

		render(
			<MantineProvider theme={ theme }>
				<SignatureAssignment
					templateId="template-1"
					onSave={ onSave }
					onApply={ onApply }
					onCancel={ onCancel }
				/>
			</MantineProvider>,
		)

		await user.click(screen.getByRole("button", { name: "Cancel" }))

		expect(onCancel).toHaveBeenCalledOnce()
		expect(onSave).not.toHaveBeenCalled()
		expect(onApply).not.toHaveBeenCalled()
	})
})
