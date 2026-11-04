import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { ConnectWorkspacePanel } from "@/frontend/features/settings/ConnectWorkspacePanel"
import { SEED_WORKSPACE_ADMIN_EMAIL, WORKSPACE_NOT_INSTALLED_MESSAGE } from "@/shared/workspace"

const connectMutate = vi.hoisted(() => vi.fn())
const workspaceData = vi.hoisted(() => ({
	directoryMode: "real" as "mock" | "real",
	marketplaceUrl: "https://workspace.google.com/marketplace/app/suiteocean",
	customer: null,
	membership: null,
	access: [] as [],
}))

vi.mock("@/frontend/hooks/useAuth", () => ({
	useAuth: () => ({ user: { email: "avram@thebatterysf.com" } }),
}))

vi.mock("@/frontend/queries/workspace", () => ({
	useWorkspaceQuery: () => ({
		isPending: false,
		isError: false,
		error: null,
		data: workspaceData,
	}),
	useConnectWorkspace: () => ({ isPending: false, mutate: connectMutate }),
}))

afterEach(() => {
	cleanup()
	connectMutate.mockReset()
	workspaceData.directoryMode = "real"
	workspaceData.marketplaceUrl = "https://workspace.google.com/marketplace/app/suiteocean"
})

describe("ConnectWorkspacePanel", () => {
	it("walks through Marketplace install before connect", () => {
		render(
			<MantineProvider>
				<ConnectWorkspacePanel />
			</MantineProvider>,
		)

		expect(screen.getByRole("heading", { name: "Connect Workspace" })).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: /Step 1: Install SuiteOcean from Google Workspace Marketplace/ })).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "Step 2: Connect as avram@thebatterysf.com" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Install from Google Workspace Marketplace" })).toHaveAttribute(
			"href",
			"https://workspace.google.com/marketplace/app/suiteocean",
		)
		expect(screen.getByRole("button", { name: "Connect" })).toBeInTheDocument()
		expect(screen.queryByLabelText("Workspace admin email")).not.toBeInTheDocument()
	})

	it("skips Marketplace install when Directory is mock", () => {
		workspaceData.directoryMode = "mock"
		workspaceData.marketplaceUrl = ""

		render(
			<MantineProvider>
				<ConnectWorkspacePanel />
			</MantineProvider>,
		)

		expect(screen.getByText(/Local mock Directory is on/)).toBeInTheDocument()
		expect(screen.getAllByText(new RegExp(SEED_WORKSPACE_ADMIN_EMAIL)).length).toBeGreaterThan(0)
		expect(screen.queryByRole("link", { name: "Install from Google Workspace Marketplace" })).not.toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Connect" })).toBeInTheDocument()
	})

	it("shows an on-page explanation when the Marketplace install is missing", async () => {
		const user = userEvent.setup()
		connectMutate.mockImplementation((_body, options) => {
			options?.onError?.(new Error(WORKSPACE_NOT_INSTALLED_MESSAGE))
		})

		render(
			<MantineProvider>
				<ConnectWorkspacePanel />
			</MantineProvider>,
		)

		await user.click(screen.getByRole("button", { name: "Connect" }))

		expect(connectMutate).toHaveBeenCalledWith({}, expect.any(Object))
		expect(screen.getByText("Installation is not finished")).toBeInTheDocument()
		expect(screen.getByText(/Install it from the Google Workspace Marketplace/)).toBeInTheDocument()
		expect(screen.getByText(/Use the Install button in Step 1/)).toBeInTheDocument()
	})
})
