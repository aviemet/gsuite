import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { WorkspaceSettings } from "@/frontend/features/settings/WorkspaceSettings"
import { apiStatusCheckIds, type ApiStatusResult } from "@/shared/workspace"

const apiStatusMock = vi.hoisted(() => ({
	isPending: false,
	isError: false,
	error: null as Error | null,
	data: undefined as { results: ApiStatusResult[] } | undefined,
	mutate: vi.fn(),
}))

vi.mock("@/frontend/hooks/useAuth", () => ({
	useAuth: () => ({ user: { email: "test@test.com" } }),
}))

vi.mock("@/frontend/queries/directory", () => ({
	useDirectoryQuery: () => ({
		data: {
			users: [
				{
					email: "jane.doe@example.com",
					displayName: "Jane Doe",
					signatureHtml: "",
					groupIds: [],
					organizationalUnitPaths: ["/"],
				},
				{
					email: "sam.lee@example.com",
					displayName: "Sam Lee",
					signatureHtml: "",
					groupIds: [],
					organizationalUnitPaths: ["/"],
				},
			],
		},
	}),
}))

vi.mock("@/frontend/queries/workspace", () => ({
	useWorkspaceQuery: () => ({
		isLoading: false,
		error: null,
		data: {
			clientId: "mock-client-id",
			scopes: ["https://www.googleapis.com/auth/admin.directory.user.readonly"],
			customer: {
				id: "example-corp",
				primaryDomain: "example.com",
				workspaceAdminEmail: "jane.doe@example.com",
				createdAt: "2026-01-01T00:00:00.000Z",
				updatedAt: "2026-01-01T00:00:00.000Z",
			},
			membership: {
				uid: "user-1",
				customerId: "example-corp",
				role: "owner",
				email: "test@test.com",
				createdAt: "2026-01-01T00:00:00.000Z",
			},
			members: [
				{
					uid: "user-1",
					customerId: "example-corp",
					role: "owner",
					email: "test@test.com",
					createdAt: "2026-01-01T00:00:00.000Z",
				},
			],
			invites: [],
		},
	}),
	useConnectWorkspace: () => ({ isPending: false, mutate: vi.fn() }),
	useSetWorkspaceAdmin: () => ({ isPending: false, mutate: vi.fn() }),
	useInviteMember: () => ({ isPending: false, mutate: vi.fn() }),
	useRemoveMember: () => ({ isPending: false, mutate: vi.fn() }),
	useAcceptInvite: () => ({ isPending: false, mutate: vi.fn() }),
	useApiStatus: () => apiStatusMock,
}))

afterEach(() => {
	cleanup()
	apiStatusMock.isPending = false
	apiStatusMock.isError = false
	apiStatusMock.error = null
	apiStatusMock.data = undefined
	apiStatusMock.mutate.mockClear()
})

function renderSettings() {
	render(
		<MantineProvider>
			<WorkspaceSettings />
		</MantineProvider>,
	)
}

describe("WorkspaceSettings", () => {
	it("keeps each settings section on its own tab", async () => {
		const user = userEvent.setup()
		renderSettings()

		expect(screen.getByRole("tab", { name: "Workspace" })).toHaveAttribute("aria-selected", "true")
		expect(screen.getByLabelText("Current Workspace admin")).toHaveValue("jane.doe@example.com")
		expect(screen.queryByText(/Domain:/)).not.toBeInTheDocument()
		expect(screen.queryByRole("option", { name: /Sam Lee/ })).not.toBeInTheDocument()
		expect(screen.queryByLabelText("Client ID")).not.toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Check again" })).not.toBeInTheDocument()
		expect(screen.queryByLabelText("Invite by email")).not.toBeInTheDocument()

		await user.click(screen.getByRole("tab", { name: "API status" }))

		expect(screen.getByRole("heading", { name: "Google API status" })).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "Admin APIs" })).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "User APIs" })).toBeInTheDocument()
		expect(screen.getByLabelText("Mailbox")).toHaveValue("jane.doe@example.com")
		expect(screen.getByText("Checking Google APIs")).toBeInTheDocument()
		expect(apiStatusMock.mutate).toHaveBeenCalledWith("jane.doe@example.com", expect.any(Object))
		expect(screen.queryByLabelText("Client ID")).not.toBeInTheDocument()
		expect(screen.queryByLabelText("Scopes")).not.toBeInTheDocument()
		expect(screen.queryByLabelText("Current Workspace admin")).not.toBeInTheDocument()

		await user.click(screen.getByRole("tab", { name: "Members" }))

		expect(screen.getByLabelText("Invite by email")).toBeInTheDocument()
		expect(screen.getByText("test@test.com (owner)")).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Check again" })).not.toBeInTheDocument()
	})

	it("shows the authorization step only after a check fails", async () => {
		const user = userEvent.setup()
		const failedGmail: ApiStatusResult = {
			id: apiStatusCheckIds.gmailSettings,
			label: "Gmail signature settings",
			group: "user",
			status: "error",
			error: "Delegation denied",
		}
		apiStatusMock.data = {
			results: [
				{ id: apiStatusCheckIds.users, label: "Users", group: "admin", status: "success" },
				{ id: apiStatusCheckIds.groups, label: "Groups", group: "admin", status: "success" },
				{ id: apiStatusCheckIds.organizationalUnits, label: "Organizational units", group: "admin", status: "success" },
				failedGmail,
			],
		}
		renderSettings()

		await user.click(screen.getByRole("tab", { name: "API status" }))

		expect(screen.getByText("Delegation denied")).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "Authorize Signature Manager" })).toBeInTheDocument()
		expect(screen.getByLabelText("Client ID")).toHaveValue("mock-client-id")
		expect(screen.getByLabelText("Scopes")).toHaveValue("https://www.googleapis.com/auth/admin.directory.user.readonly")
		expect(screen.getByRole("button", { name: "Copy client ID" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Copy scopes" })).toBeInTheDocument()
	})

	it("offers directory users in an autocomplete", async () => {
		const user = userEvent.setup()
		renderSettings()

		expect(screen.getByText(/Select a Super Admin from your directory/)).toBeInTheDocument()
		expect(screen.queryByRole("option", { name: /Jane Doe/ })).not.toBeInTheDocument()

		await user.type(screen.getByRole("combobox", { name: "Change Workspace admin" }), "sam")

		expect(screen.getByRole("option", { name: /Sam Lee/, hidden: true })).toBeInTheDocument()
		expect(screen.queryByRole("option", { name: /Jane Doe/, hidden: true })).not.toBeInTheDocument()
	})
})
