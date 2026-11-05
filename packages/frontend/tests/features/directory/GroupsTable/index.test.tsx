import { MantineProvider } from "@mantine/core"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

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
	{
		id: "engineering",
		name: "Engineering",
		email: "engineering@example.com",
		description: "",
		members: [],
	},
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
				<GroupsTable
					groups={ groups }
					users={ users }
					canEdit
					onOpenGroup={ vi.fn() }
					onQuickEditGroup={ vi.fn() }
				/>
			</MantineProvider>,
		)

		expect(screen.getByText("Engineering")).toBeInTheDocument()
		expect(screen.getByText("engineering@example.com")).toBeInTheDocument()
		expect(screen.getByText("1")).toBeInTheDocument()
	})

	it("opens the group from row text and quick edit from the actions button", () => {
		enableDataTableMediaQueries()
		const onOpenGroup = vi.fn()
		const onQuickEditGroup = vi.fn()

		render(
			<MantineProvider theme={ theme }>
				<GroupsTable
					groups={ groups }
					users={ users }
					canEdit
					onOpenGroup={ onOpenGroup }
					onQuickEditGroup={ onQuickEditGroup }
				/>
			</MantineProvider>,
		)

		fireEvent.click(screen.getByText("Engineering"))
		expect(onOpenGroup).toHaveBeenCalledTimes(1)
		expect(onQuickEditGroup).not.toHaveBeenCalled()

		fireEvent.click(screen.getByRole("button", { name: "Quick edit Engineering" }))
		expect(onQuickEditGroup).toHaveBeenCalledTimes(1)
		expect(onOpenGroup).toHaveBeenCalledTimes(1)
	})
})
