import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import "@testing-library/jest-dom/vitest"

import { GroupsTable } from "@/frontend/features/directory/GroupsTable"
import { theme } from "@/frontend/lib/theme"
import { type DirectoryGroup, type DirectoryUser, emptyDirectoryProfile } from "@/shared/directoryFixtures"

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

const groups: DirectoryGroup[] = [
	{ id: "engineering", name: "Engineering", email: "engineering@example.com" },
]

const users: DirectoryUser[] = [
	{
		...emptyDirectoryProfile(),
		email: "jane.doe@example.com",
		displayName: "Jane Doe",
		signatureHtml: "",
		groupIds: ["engineering"],
		organizationalUnitPaths: [],
	},
]

describe("GroupsTable", () => {
	it("renders group rows with member counts", () => {
		enableDataTableMediaQueries()

		render(
			<MantineProvider theme={ theme }>
				<GroupsTable groups={ groups } users={ users } />
			</MantineProvider>,
		)

		expect(screen.getByText("Engineering")).toBeInTheDocument()
		expect(screen.getByText("engineering@example.com")).toBeInTheDocument()
		expect(screen.getByText("1")).toBeInTheDocument()
	})
})
