import { MantineProvider } from "@mantine/core"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { PAGE_TITLE_PORTAL_ID } from "@/frontend/components/Page"
import { theme } from "@/frontend/lib/theme"
import { type DirectoryUser, emptyDirectoryProfile } from "@/shared/directoryFixtures"

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
}))

vi.mock("@/frontend/queries/directory", () => ({
	useDirectoryQuery: () => ({
		data: {
			users: [
				directoryUser({
					email: "z@example.com",
					displayName: "Alex Kim",
					department: "Engineering",
				}),
				directoryUser({
					email: "m@example.com",
					displayName: "Jane Doe",
					department: "Engineering",
				}),
				directoryUser({
					email: "a@example.com",
					displayName: "Sam Lee",
					department: "Sales",
				}),
			],
			groups: [],
			organizationalUnits: [],
		},
		isLoading: false,
		error: null,
	}),
	useUpdateDirectoryUser: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock("@/frontend/queries/company", () => ({
	useCompanyQuery: () => ({ data: { departments: [] }, isPending: false }),
}))

vi.mock("@/frontend/queries/templates", () => ({
	useMembershipQuery: () => ({ data: undefined }),
}))

vi.mock("@/frontend/queries/userSettings", () => ({
	useUserSettingsQuery: () => ({ data: undefined, isLoading: false }),
	useSaveTableViewPreferencesMutation: () => ({ mutate: vi.fn(), isPending: false }),
}))

import { DirectoryUsersPage } from "@/frontend/pages/Directory/Users"

function directoryUser(partial: Partial<DirectoryUser> & Pick<DirectoryUser, "email" | "displayName">): DirectoryUser {
	return {
		...emptyDirectoryProfile(),
		signatureHtml: "",
		groupIds: [],
		organizationalUnitPaths: ["/"],
		...partial,
	}
}

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

function bodyNames(): string[] {
	return [...document.querySelectorAll("tbody tr")].map((row) => row.textContent ?? "")
}

function renderUsersPage() {
	render(
		<MantineProvider theme={ theme }>
			<div id={ PAGE_TITLE_PORTAL_ID } />
			<DirectoryUsersPage />
		</MantineProvider>,
	)
}

describe("DirectoryUsersPage", () => {
	beforeEach(() => {
		sessionStorage.clear()
		enableDataTableMediaQueries()
	})

	afterEach(() => {
		cleanup()
		sessionStorage.clear()
	})

	it("leaves Clear all unavailable until a filter or sort is applied", () => {
		renderUsersPage()

		expect(screen.getByRole("textbox", { name: "Search users" })).toBeInTheDocument()
		expect(screen.queryByRole("combobox", { name: "Rows per page" })).not.toBeInTheDocument()
		expect(screen.getByText("Rows per page")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Clear all" })).toBeDisabled()
	})

	it("filters from the search box and Clear all restores the list", () => {
		renderUsersPage()

		fireEvent.change(screen.getByRole("textbox", { name: "Search users" }), {
			target: { value: "jane" },
		})

		expect(screen.getByText("Jane Doe")).toBeInTheDocument()
		expect(screen.queryByText("Alex Kim")).not.toBeInTheDocument()
		expect(screen.queryByText("Sam Lee")).not.toBeInTheDocument()

		fireEvent.click(screen.getByRole("button", { name: "Clear all" }))

		expect(screen.getByRole("textbox", { name: "Search users" })).toHaveValue("")
		expect(screen.getByText("Alex Kim")).toBeInTheDocument()
		expect(screen.getByText("Jane Doe")).toBeInTheDocument()
		expect(screen.getByText("Sam Lee")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Clear all" })).toBeDisabled()
	})

	it("clears column filters and restores name sorting", () => {
		sessionStorage.setItem("suiteocean.tableFilters.directory.users", JSON.stringify({
			department: { query: "eng", selectedValues: ["Engineering"] },
		}))
		renderUsersPage()

		expect(screen.getByText("Alex Kim")).toBeInTheDocument()
		expect(screen.getByText("Jane Doe")).toBeInTheDocument()
		expect(screen.queryByText("Sam Lee")).not.toBeInTheDocument()

		fireEvent.click(screen.getByText("Email"))
		expect(bodyNames()[0]).toContain("Jane Doe")
		expect(bodyNames()[1]).toContain("Alex Kim")

		fireEvent.click(screen.getByRole("button", { name: "Clear all" }))

		expect(bodyNames()[0]).toContain("Alex Kim")
		expect(bodyNames()[1]).toContain("Jane Doe")
		expect(bodyNames()[2]).toContain("Sam Lee")
		expect(sessionStorage.getItem("suiteocean.tableFilters.directory.users")).toBeNull()
		expect(screen.getByRole("button", { name: "Clear all" })).toBeDisabled()
	})
})
