import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { ConnectWorkspacePanel } from "@/frontend/features/settings/ConnectWorkspacePanel"
import { WORKSPACE_DELEGATION_UNAUTHORIZED_MESSAGE } from "@/shared/workspace"

const connectMutate = vi.hoisted(() => vi.fn())

vi.mock("@/frontend/hooks/useAuth", () => ({
	useAuth: () => ({ user: { email: "avram@thebatterysf.com" } }),
}))

vi.mock("@/frontend/queries/workspace", () => ({
	useWorkspaceQuery: () => ({
		isPending: false,
		isError: false,
		error: null,
		data: {
			clientId: "112775791895278687783",
			scopes: [
				"https://www.googleapis.com/auth/admin.directory.user.readonly",
				"https://www.googleapis.com/auth/gmail.settings.basic",
			],
			customer: null,
			membership: null,
			access: [],
		},
	}),
	useConnectWorkspace: () => ({ isPending: false, mutate: connectMutate }),
}))

afterEach(() => {
	cleanup()
	connectMutate.mockReset()
})

describe("ConnectWorkspacePanel", () => {
	it("walks through authorization before connect", () => {
		render(
			<MantineProvider>
				<ConnectWorkspacePanel />
			</MantineProvider>,
		)

		expect(screen.getByRole("heading", { name: "Connect Workspace" })).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: /Step 1: Authorize Suite Desk in Google Admin/ })).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "Step 2: Connect with a Super Admin email" })).toBeInTheDocument()
		expect(screen.getByLabelText("Client ID")).toHaveValue("112775791895278687783")
		expect(screen.getByLabelText("OAuth scopes")).toHaveValue(
			"https://www.googleapis.com/auth/admin.directory.user.readonly,https://www.googleapis.com/auth/gmail.settings.basic",
		)
		expect(screen.getByRole("link", { name: "Domain-wide delegation" })).toHaveAttribute(
			"href",
			"https://admin.google.com/ac/owl/domainwidedelegation",
		)
		expect(screen.getByRole("button", { name: "Connect" })).toBeInTheDocument()
		expect(screen.getByLabelText("Workspace admin email")).toHaveValue("avram@thebatterysf.com")
	})

	it("shows an on-page explanation when Google rejects delegation", async () => {
		const user = userEvent.setup()
		connectMutate.mockImplementation((_body, options) => {
			options?.onError?.(new Error(WORKSPACE_DELEGATION_UNAUTHORIZED_MESSAGE))
		})

		render(
			<MantineProvider>
				<ConnectWorkspacePanel />
			</MantineProvider>,
		)

		await user.click(screen.getByRole("button", { name: "Connect" }))

		expect(screen.getByText("Authorization is not finished")).toBeInTheDocument()
		expect(screen.getByText(/Finish Step 1 on this page/)).toBeInTheDocument()
		expect(screen.getByText(/Use the Client ID and scopes in Step 1/)).toBeInTheDocument()
	})
})
