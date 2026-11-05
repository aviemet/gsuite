import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it } from "vitest"

import "@testing-library/jest-dom/vitest"

import { UserGroupsFields } from "@/frontend/features/directory/editor/UserGroupsFields"
import { theme } from "@/frontend/lib/theme"
import { type DirectoryGroup } from "@/shared/directoryFixtures"
import { type DirectoryUserUpdate } from "@/shared/directoryUpdate"

afterEach(() => {
	cleanup()
})

function group(id: string, name: string): DirectoryGroup {
	return {
		id,
		name,
		email: `${ id }@example.com`,
		description: "",
		members: [],
	}
}

const groups = [
	group("engineering", "Engineering"),
	group("sales", "Sales"),
	...Array.from({ length: 80 }, (_, index) => group(`group-${ index }`, `Group ${ String(index).padStart(2, "0") }`)),
]

const draft: DirectoryUserUpdate = {
	email: "jane.doe@example.com",
	givenName: "Jane",
	familyName: "Doe",
	organizationalUnitPath: "/",
	jobTitle: "",
	department: "",
	organization: "",
	location: "",
	employeeId: "",
	address: "",
	costCenter: "",
	managerEmail: "",
	phoneNumbers: [],
	groupIds: ["engineering"],
}

function Harness() {
	const [value, setValue] = useState(draft)
	return (
		<MantineProvider theme={ theme }>
			<UserGroupsFields
				value={ value }
				groups={ groups }
				disabled={ false }
				onChange={ setValue }
			/>
		</MantineProvider>
	)
}

describe("UserGroupsFields", () => {
	it("filters the virtual list and toggles membership from a row", async () => {
		const user = userEvent.setup()
		render(<Harness />)

		expect(screen.getByRole("button", { name: /Engineering/ })).toHaveAttribute("aria-pressed", "true")
		expect(screen.queryByRole("button", { name: /Group 79/ })).not.toBeInTheDocument()

		await user.click(screen.getByRole("button", { name: /Engineering/ }))
		expect(screen.getByRole("button", { name: /Engineering/ })).toHaveAttribute("aria-pressed", "false")

		await user.type(screen.getByRole("textbox", { name: "Search groups" }), "sales")
		expect(screen.getByRole("button", { name: /Sales/ })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /Engineering/ })).not.toBeInTheDocument()
	})
})
