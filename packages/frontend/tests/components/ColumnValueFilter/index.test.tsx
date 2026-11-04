import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { ColumnValueFilter } from "@/frontend/components/ColumnValueFilter"
import { theme } from "@/frontend/lib/theme"

afterEach(() => {
	cleanup()
})

describe("ColumnValueFilter", () => {
	it("lists existing values and updates selected checkmarks", async () => {
		const user = userEvent.setup()
		const handleChange = vi.fn()

		render(
			<MantineProvider theme={ theme }>
				<ColumnValueFilter
					label="Department"
					values={ ["Engineering", "Sales", ""] }
					filter={ { query: "", selectedValues: null } }
					onChange={ handleChange }
					onClose={ vi.fn() }
				/>
			</MantineProvider>,
		)

		expect(screen.getByRole("checkbox", { name: "Engineering" })).toBeChecked()
		expect(screen.getByRole("checkbox", { name: "(Blank)" })).toBeChecked()

		await user.click(screen.getByRole("checkbox", { name: "Sales" }))
		expect(handleChange).toHaveBeenCalledWith({
			query: "",
			selectedValues: ["Engineering", ""],
		})
	})

	it("keeps string search while narrowing the checklist", async () => {
		const user = userEvent.setup()

		function Harness() {
			const [filter, setFilter] = useState({ query: "", selectedValues: null as string[] | null })
			return (
				<ColumnValueFilter
					label="Department"
					values={ ["Engineering", "Sales"] }
					filter={ filter }
					onChange={ setFilter }
					onClose={ vi.fn() }
				/>
			)
		}

		render(
			<MantineProvider theme={ theme }>
				<Harness />
			</MantineProvider>,
		)

		await user.type(screen.getByRole("textbox", { name: "Filter Department" }), "eng")
		expect(screen.getByRole("textbox", { name: "Filter Department" })).toHaveValue("eng")
		expect(screen.getByRole("checkbox", { name: "Engineering" })).toBeInTheDocument()
		expect(screen.queryByRole("checkbox", { name: "Sales" })).not.toBeInTheDocument()
	})
})

