import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { CompanyForm } from "@/frontend/features/company/CompanyForm"
import { theme } from "@/frontend/lib/theme"
import { type CompanyProfile } from "@/shared/company"

afterEach(() => {
	cleanup()
})

const profile: CompanyProfile = {
	name: "Northwind",
	phones: [],
	addresses: [],
	departments: [{ id: "sales", name: "Sales" }],
}

function renderForm(
	props: Partial<{
		profile: CompanyProfile
		canSave: boolean
		onSave: (profile: CompanyProfile) => void
	}> = {},
) {
	const onSave = props.onSave ?? vi.fn()
	render(
		<MantineProvider theme={ theme }>
			<CompanyForm
				profile={ props.profile ?? profile }
				canSave={ props.canSave ?? true }
				isSaving={ false }
				onSave={ onSave }
			/>
		</MantineProvider>,
	)
	return { onSave }
}

describe("CompanyForm", () => {
	it("saves the company name, a new department, a phone, and an address", async () => {
		const user = userEvent.setup()
		const { onSave } = renderForm()

		expect(screen.getByRole("region", { name: "Departments" })).toBeInTheDocument()
		expect(screen.getByRole("region", { name: "Phone numbers" })).toBeInTheDocument()
		expect(screen.getByRole("region", { name: "Addresses" })).toBeInTheDocument()
		const removeSales = screen.getByRole("button", { name: "Remove Sales" })
		expect(removeSales).not.toHaveTextContent("Remove")
		await user.clear(screen.getByRole("textbox", { name: "Company name" }))
		await user.type(screen.getByRole("textbox", { name: "Company name" }), "Contoso")
		await user.click(screen.getByRole("button", { name: "Add department" }))
		const departmentFields = screen.getAllByRole("textbox", { name: "Department name" })
		await user.type(departmentFields[1], "Engineering")
		await user.click(screen.getByRole("button", { name: "Add phone" }))
		await user.type(screen.getByRole("textbox", { name: "Phone label" }), "Main")
		await user.type(screen.getByRole("textbox", { name: "Phone number" }), "415-555-0100")
		await user.click(screen.getByRole("button", { name: "Add address" }))
		await user.type(screen.getByRole("textbox", { name: "Address label" }), "HQ")
		await user.type(screen.getByRole("textbox", { name: "Address" }), "1 Market St")
		await user.click(screen.getByRole("button", { name: "Save" }))

		expect(onSave).toHaveBeenCalledWith({
			name: "Contoso",
			departments: [
				{ id: "sales", name: "Sales" },
				{ id: expect.any(String), name: "Engineering" },
			],
			phones: [{ id: expect.any(String), label: "Main", number: "415-555-0100" }],
			addresses: [{ id: expect.any(String), label: "HQ", formatted: "1 Market St" }],
		})
	})

	it("tabs through department names before the remove buttons", () => {
		renderForm({
			profile: {
				...profile,
				departments: [
					{ id: "sales", name: "Sales" },
					{ id: "engineering", name: "Engineering" },
				],
			},
		})

		const region = screen.getByRole("region", { name: "Departments" })
		const tabOrder = [...region.querySelectorAll("input, button")].map((element) => (
			element.getAttribute("aria-label") ?? element.textContent
		))

		expect(tabOrder).toEqual([
			"Department name",
			"Department name",
			"Remove Sales",
			"Remove Engineering",
			"Add department",
		])
	})

	it("shows an error and does not save duplicate departments", async () => {
		const user = userEvent.setup()
		const { onSave } = renderForm({
			profile: {
				...profile,
				departments: [
					{ id: "one", name: "Sales" },
					{ id: "two", name: "sales" },
				],
			},
		})

		await user.click(screen.getByRole("button", { name: "Save" }))
		expect(screen.getByRole("alert")).toHaveTextContent(
			'Department "sales" is listed more than once',
		)
		expect(onSave).not.toHaveBeenCalled()
	})

	it("hides save and disables fields when the member cannot edit", () => {
		renderForm({ canSave: false })
		expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument()
		expect(screen.getByRole("textbox", { name: "Company name" })).toBeDisabled()
	})
})
