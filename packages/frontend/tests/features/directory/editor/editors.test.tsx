import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import { type ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { GroupEditor } from "@/frontend/features/directory/editor/GroupEditor"
import { OrganizationalUnitSelect } from "@/frontend/features/directory/editor/OrganizationalUnitSelect"
import { OrganizationalUnitSelectOption } from "@/frontend/features/directory/editor/OrganizationalUnitSelectOption"
import { UserEditor } from "@/frontend/features/directory/editor/UserEditor"
import { UserQuickEditModal } from "@/frontend/features/directory/editor/UserQuickEditModal"
import { theme } from "@/frontend/lib/theme"
import { type DirectoryGroup, type DirectoryUser, emptyDirectoryProfile } from "@/shared/directoryFixtures"

afterEach(() => {
	cleanup()
})

const user: DirectoryUser = {
	...emptyDirectoryProfile(),
	email: "jane.doe@example.com",
	displayName: "Jane Doe",
	givenName: "Jane",
	familyName: "Doe",
	signatureHtml: "",
	groupIds: [],
	organizationalUnitPaths: ["/"],
}

const group: DirectoryGroup = {
	id: "engineering",
	name: "Engineering",
	email: "engineering@example.com",
	description: "",
	members: [],
}

function renderWithTheme(node: ReactNode) {
	return render(<MantineProvider theme={ theme }>{ node }</MantineProvider>)
}

describe("directory editors", () => {
	it("shows the user email as a title and offers cancel", () => {
		renderWithTheme(
			<UserEditor
				user={ user }
				groups={ [] }
				organizationalUnits={ [{ path: "/", name: "Example Corp" }] }
				departments={ [] }
				canSave
				isSaving={ false }
				onCancel={ vi.fn() }
				onSave={ vi.fn() }
			/>,
		)

		expect(screen.getByRole("heading", { name: "jane.doe@example.com" })).toBeInTheDocument()
		expect(screen.queryByRole("textbox", { name: "Primary email" })).not.toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
		expect(screen.getByRole("tab", { name: "Contact" })).toBeInTheDocument()
	})

	it("opens every user tab from quick edit", () => {
		renderWithTheme(
			<UserQuickEditModal
				user={ user }
				groups={ [group] }
				organizationalUnits={ [{ path: "/", name: "Example Corp" }] }
				departments={ [] }
				opened
				canSave
				isSaving={ false }
				onClose={ vi.fn() }
				onSave={ vi.fn() }
			/>,
		)

		expect(screen.getByRole("tab", { name: "Profile" })).toBeInTheDocument()
		expect(screen.getByRole("tab", { name: "Contact" })).toBeInTheDocument()
		expect(screen.getByRole("tab", { name: "Employee" })).toBeInTheDocument()
		expect(screen.getByRole("tab", { name: "Groups" })).toBeInTheDocument()
	})

	it("offers cancel on the group editor", () => {
		renderWithTheme(
			<GroupEditor
				group={ group }
				users={ [] }
				canSave
				isSaving={ false }
				onCancel={ vi.fn() }
				onSave={ vi.fn() }
			/>,
		)

		expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
		expect(screen.getByRole("tab", { name: "Members" })).toBeInTheDocument()
	})

	it("indents a nested organizational unit and marks a parent with a chevron", () => {
		const { container } = renderWithTheme(
			<>
				<OrganizationalUnitSelectOption name="Engineering" depth={ 1 } hasChildren isChecked />
				<OrganizationalUnitSelectOption name="Platform" depth={ 2 } hasChildren={ false } isChecked={ false } />
			</>,
		)

		const engineering = screen.getByText("Engineering").closest("[data-depth]")
		const platform = screen.getByText("Platform").closest("[data-depth]")
		expect(engineering).toHaveAttribute("data-depth", "1")
		expect(platform).toHaveAttribute("data-depth", "2")
		expect(engineering).toHaveAttribute("data-checked", "true")
		expect(platform).toHaveAttribute("data-checked", "false")
		expect(engineering?.querySelectorAll("svg")).toHaveLength(2)
		expect(platform?.querySelector("svg")).toBeNull()
		expect(container).toBeTruthy()
	})

	it("shows a check mark on the selected organizational unit", () => {
		renderWithTheme(
			<OrganizationalUnitSelect
				value="/Engineering"
				organizationalUnits={ [
					{ path: "/", name: "Example Corp" },
					{ path: "/Engineering", name: "Engineering" },
					{ path: "/Sales", name: "Sales" },
				] }
				disabled={ false }
				onChange={ vi.fn() }
			/>,
		)

		const engineering = screen.getByRole("option", { name: "Engineering", hidden: true })
		const sales = screen.getByRole("option", { name: "Sales", hidden: true })
		expect(engineering.querySelector(".tabler-icon-check")).not.toBeNull()
		expect(sales.querySelector(".tabler-icon-check")).toBeNull()
	})
})
