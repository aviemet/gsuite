import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
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
				/>
			</MantineProvider>,
		)

		expect(screen.getByText("Jane Doe")).toBeInTheDocument()
		expect(screen.getByText("jane.doe@example.com")).toBeInTheDocument()
		expect(screen.queryByText("Engineer")).not.toBeInTheDocument()
		expect(screen.getByText("Name")).toBeInTheDocument()
		expect(screen.getByText("Email")).toBeInTheDocument()
		expect(screen.queryByText("Job title")).not.toBeInTheDocument()
	})
})
