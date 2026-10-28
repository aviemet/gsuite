import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { ConnectWorkspacePanel } from "@/frontend/features/settings/ConnectWorkspacePanel"

vi.mock("@/frontend/hooks/useAuth", () => ({
	useAuth: () => ({ user: { email: "avram@thebatterysf.com" } }),
}))

vi.mock("@/frontend/queries/workspace", () => ({
	useConnectWorkspace: () => ({ isPending: false, mutate: vi.fn() }),
}))

afterEach(() => {
	cleanup()
})

describe("ConnectWorkspacePanel", () => {
	it("only offers Connect for a first-time Workspace link", () => {
		render(
			<MantineProvider>
				<ConnectWorkspacePanel />
			</MantineProvider>,
		)

		expect(screen.getByRole("button", { name: "Connect" })).toBeInTheDocument()
		expect(screen.getByLabelText("Workspace admin email")).toHaveValue("avram@thebatterysf.com")
	})
})
