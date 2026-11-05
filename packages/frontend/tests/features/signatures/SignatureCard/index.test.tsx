import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { type ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { SignatureCard } from "@/frontend/features/signatures/SignatureCard"
import { theme } from "@/frontend/lib/theme"
import { type Template } from "@/frontend/types/firebase"

const navigate = vi.fn()

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children }: { children: ReactNode }) => <a href="/">{ children }</a>,
	useRouter: () => ({
		navigate,
	}),
}))

vi.mock("@/frontend/queries/templates", () => ({
	useTemplatesQuery: () => ({
		data: [{ id: "template-1", isDefault: true, isActive: true, updatedAt: "2026-01-01T00:00:00.000Z" }],
	}),
	useTemplateAssignmentsQuery: () => ({ data: [] }),
}))

vi.mock("@/frontend/queries/directory", () => ({
	useDirectoryQuery: () => ({ data: { users: [], groups: [], organizationalUnits: [] } }),
}))

vi.mock("@/frontend/features/signatures/deploySignatureTemplate", () => ({
	deploySignatureTemplate: vi.fn(),
}))

vi.mock("@/frontend/features/signatures/notifyDeployResult", () => ({
	notifyDeploySuccess: vi.fn(),
	notifyDeployError: vi.fn(),
}))

afterEach(() => {
	cleanup()
})

const template: Template = {
	id: "template-1",
	name: "Professional Signature",
	content: "<p><strong>{{fullName}}</strong></p>",
	variables: ["fullName"],
	conditions: [],
	isScheduled: false,
	createdBy: "admin",
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
	isActive: true,
	customerId: "customer-1",
}

describe("SignatureCard", () => {
	it("exposes deploy and edit actions with tooltips", async () => {
		const user = userEvent.setup()
		render(
			<MantineProvider theme={ theme }>
				<SignatureCard
					template={ template }
					assignmentSummary={ {
						text: "Engineering",
						details: [{ kind: "group", label: "Engineering" }],
						hasDetailTooltip: false,
					} }
				/>
			</MantineProvider>,
		)

		const deployButton = screen.getByRole("button", { name: "Deploy Professional Signature" })
		const assignmentButton = screen.getByRole("button", { name: "Assignment for Professional Signature" })
		const editButton = screen.getByRole("button", { name: "Edit Professional Signature" })

		await user.hover(deployButton)
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Deploy")

		await user.unhover(deployButton)
		await waitFor(() => {
			expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
		})

		await user.hover(assignmentButton)
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Assignment")
		await user.click(assignmentButton)
		expect(navigate).toHaveBeenCalledWith({
			to: "/admin/signatures/$id/assignment",
			params: { id: "template-1" },
		})

		await user.unhover(assignmentButton)
		await waitFor(() => {
			expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
		})

		await user.hover(editButton)
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Edit")
	})
})
