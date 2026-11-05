import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import "@testing-library/jest-dom/vitest"

import { UserGroupsFields } from "@/frontend/features/directory/editor/UserGroupsFields"
import { theme } from "@/frontend/lib/theme"
import { type DirectoryGroup } from "@/shared/directoryFixtures"
import { type DirectoryUserUpdate } from "@/shared/directoryUpdate"

beforeEach(() => {
	Element.prototype.scrollIntoView = () => {}
})

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

function Harness({ disabled = false }: { disabled?: boolean }) {
	const [value, setValue] = useState(draft)
	return (
		<MantineProvider theme={ theme }>
			<UserGroupsFields
				value={ value }
				groups={ groups }
				disabled={ disabled }
				onChange={ setValue }
			/>
		</MantineProvider>
	)
}

describe("UserGroupsFields", () => {
	it("keeps selected groups out of the catalog and moves them when chosen or removed", async () => {
		const user = userEvent.setup()
		render(<Harness />)

		expect(screen.getByRole("button", { name: /Remove Engineering/ })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /Add Engineering/ })).not.toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /Group 79/ })).not.toBeInTheDocument()

		await user.click(screen.getByRole("button", { name: /Remove Engineering/ }))
		expect(screen.queryByRole("button", { name: /Remove Engineering/ })).not.toBeInTheDocument()
		expect(screen.getByRole("button", { name: /Add Engineering/ })).toBeInTheDocument()

		await user.type(screen.getByRole("textbox", { name: "Add a group" }), "sales")
		expect(screen.getByRole("button", { name: /Add Sales/ })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /Add Engineering/ })).not.toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /Group 79/ })).not.toBeInTheDocument()

		await user.click(screen.getByRole("button", { name: /Add Sales/ }))
		expect(screen.getByRole("button", { name: /Remove Sales/ })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /Add Sales/ })).not.toBeInTheDocument()
		expect(screen.getByRole("combobox", { name: "Role in Sales" })).toHaveValue("Member")
		expect(screen.getByText("That group is already selected")).toBeInTheDocument()
	})

	it("sets a group role to one of member, manager, or owner", async () => {
		const user = userEvent.setup()
		render(<Harness />)

		const role = screen.getByRole("combobox", { name: "Role in Engineering" })
		expect(role).toHaveValue("Member")
		await user.click(role)
		expect(screen.getAllByRole("option", { hidden: true }).map((option) => option.textContent?.trim())).toEqual([
			"Owner",
			"Manager",
			"Member",
		])
		await user.keyboard("{ArrowUp}{Enter}")
		expect(role).toHaveValue("Manager")
	})

	it("adds the only search match when Enter is pressed and ignores Enter when several match", async () => {
		const user = userEvent.setup()
		render(<Harness />)

		await user.type(screen.getByRole("textbox", { name: "Add a group" }), "group{enter}")
		expect(screen.getAllByRole("button", { name: /Remove / })).toHaveLength(1)

		await user.clear(screen.getByRole("textbox", { name: "Add a group" }))
		await user.type(screen.getByRole("textbox", { name: "Add a group" }), "sales{enter}")
		expect(screen.getByRole("button", { name: /Remove Sales/ })).toBeInTheDocument()
	})

	it("does not change membership while the editor is read only", async () => {
		const user = userEvent.setup()
		render(<Harness disabled />)

		await user.click(screen.getByRole("button", { name: /Remove Engineering/ }))
		expect(screen.getByRole("button", { name: /Remove Engineering/ })).toBeDisabled()
		expect(screen.getByRole("button", { name: /Remove Engineering/ })).toBeInTheDocument()
	})
})
