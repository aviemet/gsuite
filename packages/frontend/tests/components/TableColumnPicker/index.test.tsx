import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { TableColumnPicker } from "@/frontend/components/TableColumnPicker"
import { type TableColumnDefinition } from "@/frontend/lib/tableView"
import { theme } from "@/frontend/lib/theme"

afterEach(() => {
	cleanup()
})

interface Row {
	name: string
	email: string
}

const columns: TableColumnDefinition<Row>[] = [
	{ id: "name", label: "Name", defaultVisible: true, getValue: (row) => row.name },
	{ id: "email", label: "Email", defaultVisible: true, getValue: (row) => row.email },
]

describe("TableColumnPicker", () => {
	it("toggles columns and refuses to hide the last visible column", async () => {
		const user = userEvent.setup()
		const handleChange = vi.fn()

		render(
			<MantineProvider theme={ theme }>
				<TableColumnPicker
					columns={ columns }
					visibleColumnIds={ ["name"] }
					onChange={ handleChange }
				/>
			</MantineProvider>,
		)

		await user.click(screen.getByRole("button", { name: "Columns" }))
		expect(await screen.findByRole("checkbox", { name: "Name" })).toBeDisabled()

		await user.click(await screen.findByRole("checkbox", { name: "Email" }))
		expect(handleChange).toHaveBeenCalledWith(["name", "email"])
	})
})
