import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { WorkspaceAdminPanel } from "@/frontend/features/settings/WorkspaceAdminPanel"

vi.mock("@/frontend/hooks/useAuth", () => ({
	useAuth: () => ({ user: { email: "avram@thebatterysf.com" } }),
}))

vi.mock("@/frontend/queries/directory", () => ({
	useDirectoryQuery: () => ({ data: { users: [] } }),
}))

vi.mock("@/frontend/queries/workspace", () => ({
	useWorkspaceQuery: () => ({
		data: {
			clientId: "mock-client-id",
			scopes: [],
			customer: null,
			membership: null,
			access: [],
		},
	}),
	useConnectWorkspace: () => ({ isPending: false, mutate: vi.fn() }),
	useSetWorkspaceAdmin: () => ({ isPending: false, mutate: vi.fn() }),
}))

afterEach(() => {
	cleanup()
})

describe("WorkspaceAdminPanel connect path", () => {
	it("only offers Connect for a first-time Workspace link", () => {
		render(
			<MantineProvider>
				<WorkspaceAdminPanel />
			</MantineProvider>,
		)

		expect(screen.getByRole("button", { name: "Connect" })).toBeInTheDocument()
		expect(screen.getByLabelText("Workspace admin email")).toHaveValue("avram@thebatterysf.com")
	})
})
