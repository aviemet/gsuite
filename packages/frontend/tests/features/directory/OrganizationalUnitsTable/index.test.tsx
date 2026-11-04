import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import "@testing-library/jest-dom/vitest"

import { OrganizationalUnitsTable } from "@/frontend/features/directory/OrganizationalUnitsTable"
import { theme } from "@/frontend/lib/theme"
import {
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
	emptyDirectoryProfile,
} from "@/shared/directoryFixtures"

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

const organizationalUnits: DirectoryOrganizationalUnit[] = [
	{ path: "/Engineering", name: "Engineering" },
]

const users: DirectoryUser[] = [
	{
		...emptyDirectoryProfile(),
		email: "jane.doe@example.com",
		displayName: "Jane Doe",
		signatureHtml: "",
		groupIds: [],
		organizationalUnitPaths: ["/", "/Engineering"],
	},
]

describe("OrganizationalUnitsTable", () => {
	it("renders organizational unit rows with user counts", () => {
		enableDataTableMediaQueries()

		render(
			<MantineProvider theme={ theme }>
				<OrganizationalUnitsTable
					organizationalUnits={ organizationalUnits }
					users={ users }
				/>
			</MantineProvider>,
		)

		expect(screen.getByText("Engineering")).toBeInTheDocument()
		expect(screen.getByText("/Engineering")).toBeInTheDocument()
		expect(screen.getByText("1")).toBeInTheDocument()
	})
})
