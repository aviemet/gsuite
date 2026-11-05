import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { DeploySignatureAction } from "@/frontend/features/signatures/DeploySignatureAction"
import { theme } from "@/frontend/lib/theme"
import { directoryUsers } from "@/shared/directoryFixtures"
import { assignmentTypes } from "@/shared/template"

const deploySignatureTemplate = vi.fn()
const notifyDeploySuccess = vi.fn()
const notifyDeployError = vi.fn()

vi.mock("@/frontend/features/signatures/deploySignatureTemplate", () => ({
	deploySignatureTemplate: (...args: unknown[]) => deploySignatureTemplate(...args),
}))

vi.mock("@/frontend/features/signatures/notifyDeployResult", () => ({
	notifyDeploySuccess: (...args: unknown[]) => notifyDeploySuccess(...args),
	notifyDeployError: (...args: unknown[]) => notifyDeployError(...args),
}))

vi.mock("@/frontend/queries/templates", () => ({
	useTemplatesQuery: () => ({
		data: [
			{
				id: "template-1",
				name: "Professional Signature",
				isDefault: false,
				isActive: true,
				updatedAt: "2026-01-01T00:00:00.000Z",
			},
		],
	}),
	useTemplateAssignmentsQuery: () => ({
		data: [
			{
				templateId: "template-1",
				assignmentType: assignmentTypes.user,
				targetId: "jane.doe@example.com",
				isActive: true,
			},
		],
	}),
}))

vi.mock("@/frontend/queries/directory", () => ({
	useDirectoryQuery: () => ({
		data: {
			users: directoryUsers,
			groups: [],
			organizationalUnits: [],
		},
	}),
}))

afterEach(() => {
	cleanup()
	deploySignatureTemplate.mockReset()
	notifyDeploySuccess.mockReset()
	notifyDeployError.mockReset()
})

describe("DeploySignatureAction", () => {
	it("opens a confirmation modal with recipients before deploying", async () => {
		const user = userEvent.setup()
		deploySignatureTemplate.mockResolvedValue({
			templateId: "template-1",
			queuedUserCount: 1,
		})

		render(
			<MantineProvider theme={ theme }>
				<DeploySignatureAction
					templateId="template-1"
					templateName="Professional Signature"
				/>
			</MantineProvider>,
		)

		await user.click(screen.getByRole("button", { name: "Deploy Professional Signature" }))

		expect(await screen.findByRole("dialog", { name: "Deploy Professional Signature?" })).toBeInTheDocument()
		expect(screen.getByText("Will apply to 1 mailbox")).toBeInTheDocument()
		expect(screen.getByText("Jane Doe")).toBeInTheDocument()
		expect(deploySignatureTemplate).not.toHaveBeenCalled()

		await user.click(screen.getByRole("button", { name: "Deploy" }))

		expect(deploySignatureTemplate).toHaveBeenCalledWith("template-1")
		expect(notifyDeploySuccess).toHaveBeenCalledWith(1)
		expect(notifyDeployError).not.toHaveBeenCalled()
	})

	it("does not deploy when the confirmation is cancelled", async () => {
		const user = userEvent.setup()

		render(
			<MantineProvider theme={ theme }>
				<DeploySignatureAction
					templateId="template-1"
					templateName="Professional Signature"
				/>
			</MantineProvider>,
		)

		await user.click(screen.getByRole("button", { name: "Deploy Professional Signature" }))
		await user.click(await screen.findByRole("button", { name: "Cancel" }))

		expect(deploySignatureTemplate).not.toHaveBeenCalled()
		expect(screen.queryByRole("dialog", { name: "Deploy Professional Signature?" })).not.toBeInTheDocument()
	})

	it("reports deploy failures from the confirmation modal", async () => {
		const user = userEvent.setup()
		deploySignatureTemplate.mockRejectedValue(new Error("Template not found"))

		render(
			<MantineProvider theme={ theme }>
				<DeploySignatureAction
					templateId="template-1"
					templateName="Professional Signature"
				/>
			</MantineProvider>,
		)

		await user.click(screen.getByRole("button", { name: "Deploy Professional Signature" }))
		await user.click(await screen.findByRole("button", { name: "Deploy" }))

		expect(notifyDeployError).toHaveBeenCalledWith(expect.any(Error))
		expect(notifyDeploySuccess).not.toHaveBeenCalled()
	})

	it("shows a Deploy tooltip on hover", async () => {
		const user = userEvent.setup()

		render(
			<MantineProvider theme={ theme }>
				<DeploySignatureAction
					templateId="template-1"
					templateName="Professional Signature"
				/>
			</MantineProvider>,
		)

		await user.hover(screen.getByRole("button", { name: "Deploy Professional Signature" }))

		expect(await screen.findByRole("tooltip")).toHaveTextContent("Deploy")
	})
})
