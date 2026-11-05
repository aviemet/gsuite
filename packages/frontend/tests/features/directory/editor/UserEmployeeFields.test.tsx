import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { UserEmployeeFields } from "@/frontend/features/directory/editor/UserEmployeeFields"
import { theme } from "@/frontend/lib/theme"
import { type DirectoryUserUpdate } from "@/shared/directoryUpdate"

beforeEach(() => {
	Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
	cleanup()
})

const draft: DirectoryUserUpdate = {
	email: "jane.doe@example.com",
	givenName: "Jane",
	familyName: "Doe",
	organizationalUnitPath: "/",
	jobTitle: "",
	department: "Legacy",
	organization: "",
	location: "",
	employeeId: "",
	address: "",
	costCenter: "",
	managerEmail: "",
	phoneNumbers: [],
	groupIds: [],
}

function DepartmentField({ departments }: { departments: readonly string[] | undefined }) {
	const [value, setValue] = useState(draft)
	return (
		<UserEmployeeFields
			value={ value }
			departments={ departments }
			disabled={ false }
			onChange={ setValue }
		/>
	)
}

describe("UserEmployeeFields", () => {
	it("suggests company departments and still accepts any department", async () => {
		const user = userEvent.setup()

		render(
			<MantineProvider theme={ theme }>
				<DepartmentField departments={ ["Sales", "Engineering"] } />
			</MantineProvider>,
		)

		const department = screen.getByRole("combobox", { name: "Department" })
		await user.clear(department)
		await user.click(department)
		expect(screen.getByRole("option", { name: "Sales", hidden: true })).toBeInTheDocument()
		expect(screen.getByRole("option", { name: "Engineering", hidden: true })).toBeInTheDocument()

		await user.type(department, "Field Ops")
		expect(department).toHaveValue("Field Ops")

		await user.clear(department)
		await user.click(screen.getByRole("option", { name: "Sales", hidden: true }))
		expect(department).toHaveValue("Sales")
	})

	it("accepts a department before company suggestions have loaded", async () => {
		const user = userEvent.setup()

		render(
			<MantineProvider theme={ theme }>
				<DepartmentField departments={ undefined } />
			</MantineProvider>,
		)

		const department = screen.getByRole("combobox", { name: "Department" })
		expect(department).toBeEnabled()
		await user.clear(department)
		await user.type(department, "Field Ops")
		expect(department).toHaveValue("Field Ops")
	})
})
