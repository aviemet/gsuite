import { MantineProvider } from "@mantine/core"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { theme } from "@/frontend/lib/theme"
import { SignatureAssignmentPage } from "@/frontend/pages/Signatures/Assignment"
import { type Template, type TemplateAssignment } from "@/frontend/types/firebase"
import { directoryGroups, directoryOrganizationalUnits, directoryUsers } from "@/shared/directoryFixtures"
import { assignmentTypes } from "@/shared/template"

const navigate = vi.hoisted(() => vi.fn())
const saveAssignment = vi.hoisted(() => vi.fn())
const deploySignatureTemplate = vi.hoisted(() => vi.fn())

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

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => navigate,
}))

vi.mock("@mantine/notifications", () => ({
	notifications: { show: vi.fn() },
}))

vi.mock("@/frontend/features/signatures/saveAssignment", () => ({
	saveAssignment,
}))

vi.mock("@/frontend/features/signatures/deploySignatureTemplate", () => ({
	deploySignatureTemplate,
}))

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

function renderPage() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
	render(
		<QueryClientProvider client={ queryClient }>
			<MantineProvider theme={ theme }>
				<SignatureAssignmentPage templateId="template-1" />
			</MantineProvider>
		</QueryClientProvider>,
	)
}

async function chooseApplyOption(name: RegExp) {
	const user = userEvent.setup({
		pointerEventsCheck: PointerEventsCheckLevel.Never,
	})
	await user.click(screen.getByRole("button", { name: "Apply" }))
	await user.click(await screen.findByRole("menuitem", { name, hidden: true }))
}

afterEach(() => {
	cleanup()
	navigate.mockReset()
	saveAssignment.mockReset()
	deploySignatureTemplate.mockReset()
})

describe("SignatureAssignmentPage", () => {
	it("returns to the signature list after saving", async () => {
		saveAssignment.mockResolvedValue({ templateId: "template-1" })
		renderPage()

		await chooseApplyOption(/Mailboxes are not updated/)

		await waitFor(() => {
			expect(navigate).toHaveBeenCalledWith({ to: "/admin/signatures" })
		})
		expect(deploySignatureTemplate).not.toHaveBeenCalled()
	})

	it("returns to the signature list after saving and deploying", async () => {
		const user = userEvent.setup()
		saveAssignment.mockResolvedValue({ templateId: "template-1" })
		deploySignatureTemplate.mockResolvedValue({ queuedUserCount: 1 })
		renderPage()

		await chooseApplyOption(/update the matched mailboxes/)
		await user.click(await screen.findByRole("button", { name: "Deploy" }))

		await waitFor(() => {
			expect(navigate).toHaveBeenCalledWith({ to: "/admin/signatures" })
		})
		expect(saveAssignment).toHaveBeenCalledOnce()
		expect(deploySignatureTemplate).toHaveBeenCalledWith("template-1")
	})

	it("stays on the page when saving fails", async () => {
		saveAssignment.mockRejectedValue(new Error("Assignment conflict"))
		renderPage()

		await chooseApplyOption(/Mailboxes are not updated/)

		await waitFor(() => {
			expect(saveAssignment).toHaveBeenCalledOnce()
		})
		expect(navigate).not.toHaveBeenCalled()
	})
})
