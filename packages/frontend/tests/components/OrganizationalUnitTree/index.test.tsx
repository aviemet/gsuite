import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { OrganizationalUnitTree } from "@/frontend/components/OrganizationalUnitTree"
import { buildOrganizationalUnitTree } from "@/frontend/features/signatures/SignatureWizard/buildOrganizationalUnitTree"

afterEach(() => {
	cleanup()
})

const data = buildOrganizationalUnitTree([
	{ path: "/", name: "Example Corp" },
	{ path: "/Engineering", name: "Engineering" },
	{ path: "/Engineering/Platform", name: "Platform" },
	{ path: "/Sales", name: "Sales" },
])

function renderTree(value: string[] = [], onChange = vi.fn()) {
	render(
		<MantineProvider>
			<OrganizationalUnitTree
				label="Organizational units"
				data={ data }
				value={ value }
				onChange={ onChange }
			/>
		</MantineProvider>,
	)
	return onChange
}

describe("OrganizationalUnitTree", () => {
	it("toggles an organizational unit into the selection", async () => {
		const user = userEvent.setup()
		const onChange = renderTree()

		await user.click(screen.getByText("Engineering"))

		expect(onChange).toHaveBeenCalledWith(["/Engineering"])
	})

	it("removes a checked organizational unit on second click", async () => {
		const user = userEvent.setup()
		const onChange = renderTree(["/Engineering", "/Sales"])

		await user.click(screen.getByText("Engineering"))

		expect(onChange).toHaveBeenCalledWith(["/Sales"])
	})

	it("filters the tree by search while keeping ancestors", async () => {
		const user = userEvent.setup()
		renderTree()

		await user.type(screen.getByRole("textbox", { name: "Search organizational units" }), "Platform")

		expect(screen.getByText("Platform")).toBeInTheDocument()
		expect(screen.getByText("Engineering")).toBeInTheDocument()
		expect(screen.getByText("Example Corp")).toBeInTheDocument()
		expect(screen.queryByText("Sales")).not.toBeInTheDocument()
	})

	it("shows an empty message when search matches nothing", async () => {
		const user = userEvent.setup()
		renderTree()

		await user.type(screen.getByRole("textbox", { name: "Search organizational units" }), "zzz")

		expect(screen.getByText("No organizational units found")).toBeInTheDocument()
	})

	it("collapses a branch without changing selection", async () => {
		const user = userEvent.setup()
		const onChange = renderTree(["/Engineering"])

		await user.click(screen.getByRole("button", { name: "Collapse Engineering" }))

		expect(screen.queryByText("Platform")).not.toBeInTheDocument()
		expect(onChange).not.toHaveBeenCalled()
	})
})
