import { MantineProvider } from "@mantine/core"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { UsersTable } from "@/frontend/features/directory/UsersTable"
import { toDirectoryUserRow } from "@/frontend/features/directory/UsersTable/sortDirectoryUsers"
import { userColumns } from "@/frontend/features/directory/UsersTable/userColumns"
import { resolveVisibleColumns } from "@/frontend/lib/tableView"
import { theme } from "@/frontend/lib/theme"
import { type DirectoryUser, emptyDirectoryProfile } from "@/shared/directoryFixtures"

afterEach(() => {
	cleanup()
})

function enableDataTableMediaQueries() {
	window.matchMedia = ((query: string) => ({
		matches: true,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	})) as typeof window.matchMedia
}

function user(partial: Partial<DirectoryUser> & Pick<DirectoryUser, "email" | "displayName">): DirectoryUser {
	return {
		...emptyDirectoryProfile(),
		signatureHtml: "",
		groupIds: ["engineering"],
		organizationalUnitPaths: ["/", "/Engineering"],
		jobTitle: "Engineer",
		department: "Engineering",
		...partial,
	}
}

describe("UsersTable", () => {
	it("renders visible columns and filter controls", () => {
		enableDataTableMediaQueries()
		const visibleColumns = resolveVisibleColumns(userColumns, ["displayName", "email"])

		render(
			<MantineProvider theme={ theme }>
				<UsersTable
					users={ [
						toDirectoryUserRow(user({
							email: "jane.doe@example.com",
							displayName: "Jane Doe",
						})),
					] }
					columns={ visibleColumns }
					columnFilters={ {} }
					onColumnFilterChange={ vi.fn() }
					recordLimit={ 25 }
					loading={ false }
					canEdit
					onOpenUser={ vi.fn() }
					onQuickEditUser={ vi.fn() }
				/>
			</MantineProvider>,
		)

		expect(screen.getByText("Jane Doe")).toBeInTheDocument()
		const table = document.querySelector("table")
		expect(table).toHaveStyle({ width: "100%", tableLayout: "fixed" })
		expect(table).toHaveAttribute("data-striped")
		expect(table).toHaveAttribute("data-highlight-on-hover")
		expect(screen.getByText("jane.doe@example.com")).toBeInTheDocument()
		expect(screen.queryByText("Engineer")).not.toBeInTheDocument()
		expect(screen.getByText("Name")).toBeInTheDocument()
		expect(screen.getByText("Email")).toBeInTheDocument()
		expect(screen.queryByText("Job title")).not.toBeInTheDocument()
	})

	it("shows Active, Suspended, and Archived in the status column", () => {
		enableDataTableMediaQueries()
		const visibleColumns = resolveVisibleColumns(userColumns, ["displayName", "accountStatus"])

		render(
			<MantineProvider theme={ theme }>
				<UsersTable
					users={ [
						toDirectoryUserRow(user({
							email: "jane.doe@example.com",
							displayName: "Jane Doe",
							accountStatus: "Active",
						})),
						toDirectoryUserRow(user({
							email: "sam.lee@example.com",
							displayName: "Sam Lee",
							accountStatus: "Suspended",
						})),
						toDirectoryUserRow(user({
							email: "alex.kim@example.com",
							displayName: "Alex Kim",
							accountStatus: "Archived",
						})),
					] }
					columns={ visibleColumns }
					columnFilters={ {} }
					onColumnFilterChange={ vi.fn() }
					recordLimit={ 25 }
					loading={ false }
					canEdit={ false }
					onOpenUser={ vi.fn() }
					onQuickEditUser={ vi.fn() }
				/>
			</MantineProvider>,
		)

		expect(screen.getByText("Status")).toBeInTheDocument()
		expect(screen.getByText("Active")).toBeInTheDocument()
		expect(screen.getByText("Suspended")).toBeInTheDocument()
		expect(screen.getByText("Archived")).toBeInTheDocument()
	})

	it("opens the user from row text and quick edit from the actions button", () => {
		enableDataTableMediaQueries()
		const onOpenUser = vi.fn()
		const onQuickEditUser = vi.fn()
		const visibleColumns = resolveVisibleColumns(userColumns, ["displayName", "email"])
		const jane = toDirectoryUserRow(user({
			email: "jane.doe@example.com",
			displayName: "Jane Doe",
		}))

		render(
			<MantineProvider theme={ theme }>
				<UsersTable
					users={ [jane] }
					columns={ visibleColumns }
					columnFilters={ {} }
					onColumnFilterChange={ vi.fn() }
					recordLimit={ 25 }
					loading={ false }
					canEdit
					onOpenUser={ onOpenUser }
					onQuickEditUser={ onQuickEditUser }
				/>
			</MantineProvider>,
		)

		fireEvent.click(screen.getByText("Jane Doe"))
		expect(onOpenUser).toHaveBeenCalledWith(jane)
		expect(onQuickEditUser).not.toHaveBeenCalled()

		fireEvent.click(screen.getByRole("button", { name: "Quick edit Jane Doe" }))
		expect(onQuickEditUser).toHaveBeenCalledWith(jane)
		expect(onOpenUser).toHaveBeenCalledTimes(1)
	})

	it("shows row placeholders instead of an empty message while loading", () => {
		enableDataTableMediaQueries()
		const visibleColumns = resolveVisibleColumns(userColumns, ["displayName", "email"])

		render(
			<MantineProvider theme={ theme }>
				<UsersTable
					users={ [] }
					columns={ visibleColumns }
					columnFilters={ {} }
					onColumnFilterChange={ vi.fn() }
					recordLimit={ 25 }
					loading
					canEdit={ false }
					onOpenUser={ vi.fn() }
					onQuickEditUser={ vi.fn() }
				/>
			</MantineProvider>,
		)

		expect(screen.getByLabelText("Loading users")).toBeInTheDocument()
		expect(screen.queryByText("No users found")).not.toBeInTheDocument()
		expect(document.querySelectorAll(".mantine-Skeleton-root").length).toBe(8)
	})

	it("shows the page size control beside the result count", () => {
		enableDataTableMediaQueries()
		const visibleColumns = resolveVisibleColumns(userColumns, ["displayName"])

		render(
			<MantineProvider theme={ theme }>
				<UsersTable
					users={ [
						toDirectoryUserRow(user({
							email: "jane.doe@example.com",
							displayName: "Jane Doe",
						})),
					] }
					columns={ visibleColumns }
					columnFilters={ {} }
					onColumnFilterChange={ vi.fn() }
					recordLimit={ 25 }
					onRecordLimitChange={ vi.fn() }
					loading={ false }
					canEdit={ false }
					onOpenUser={ vi.fn() }
					onQuickEditUser={ vi.fn() }
				/>
			</MantineProvider>,
		)

		const footer = document.querySelector(".mantine-datatable-pagination")
		expect(footer).toHaveTextContent("1 - 1 / 1")
		expect(footer).toHaveTextContent("Rows per page")
		expect(footer).toContainElement(screen.getByRole("button", { name: "25" }))
	})
})
