import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { ApiStatusPanel } from "@/frontend/features/settings/ApiStatusPanel"
import { apiStatusCheckIds, type ApiStatusResult } from "@/shared/workspace"

afterEach(() => {
	cleanup()
})

const successResults: ApiStatusResult[] = [
	{ id: apiStatusCheckIds.users, label: "Users", group: "admin", status: "success" },
	{ id: apiStatusCheckIds.groups, label: "Groups", group: "admin", status: "success" },
	{ id: apiStatusCheckIds.organizationalUnits, label: "Organizational units", group: "admin", status: "success" },
	{ id: apiStatusCheckIds.gmailSettings, label: "Gmail signature settings", group: "user", status: "success" },
]

function renderPanel(results: readonly ApiStatusResult[] | undefined, isChecking = false) {
	const onCheck = vi.fn()
	render(
		<MantineProvider>
			<ApiStatusPanel
				userEmail="jane.doe@example.com"
				isChecking={ isChecking }
				results={ results }
				onUserEmailChange={ vi.fn() }
				onCheck={ onCheck }
			/>
		</MantineProvider>,
	)
	return { onCheck }
}

describe("ApiStatusPanel", () => {
	it("shows an idle mark for each check before they run", () => {
		renderPanel(undefined)

		expect(screen.getByText("Not checked yet")).toBeInTheDocument()
		expect(screen.getAllByText("Not checked")).toHaveLength(4)
		expect(document.querySelectorAll("[data-state='idle']").length).toBeGreaterThan(0)
	})

	it("spins each check while they run, then shows a check mark when they pass", async () => {
		const user = userEvent.setup()
		renderPanel(undefined, true)

		expect(screen.getByText("Checking Google APIs")).toBeInTheDocument()
		expect(document.querySelectorAll("[data-state='checking']").length).toBeGreaterThan(0)
		expect(document.querySelector(".tabler-icon-loader-2")).toBeTruthy()

		cleanup()
		const { onCheck } = renderPanel(successResults)

		expect(screen.getByText("All APIs are available")).toBeInTheDocument()
		expect(screen.getAllByText("Ready")).toHaveLength(4)
		expect(document.querySelectorAll(".tabler-icon-circle-check").length).toBeGreaterThanOrEqual(4)
		expect(document.querySelectorAll("[data-state='success']").length).toBeGreaterThanOrEqual(4)

		expect(screen.getByLabelText("Mailbox")).toHaveValue("jane.doe@example.com")
		expect(screen.queryByRole("button", { name: "Check all" })).not.toBeInTheDocument()

		await user.click(screen.getByRole("button", { name: "Check again" }))
		expect(onCheck).toHaveBeenCalledWith("jane.doe@example.com")
	})

	it("shows a cross and the error when a check fails", () => {
		renderPanel([
			...successResults.slice(0, 3),
			{
				id: apiStatusCheckIds.gmailSettings,
				label: "Gmail signature settings",
				group: "user",
				status: "error",
				error: "Delegation denied",
			},
		])

		expect(screen.getByText("Some APIs need attention")).toBeInTheDocument()
		expect(screen.getByText("Delegation denied")).toBeInTheDocument()
		expect(document.querySelector(".tabler-icon-circle-x")).toBeTruthy()
	})
})
