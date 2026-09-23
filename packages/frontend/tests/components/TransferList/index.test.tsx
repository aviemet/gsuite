import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"

import { TransferList } from "@/frontend/components/TransferList"

afterEach(() => {
	cleanup()
})

const people = [
	{ value: "jane.doe@example.com", label: "Jane Doe (jane.doe@example.com)" },
	{ value: "sam.lee@example.com", label: "Sam Lee (sam.lee@example.com)" },
	{ value: "alex.kim@example.com", label: "Alex Kim (alex.kim@example.com)" },
]

function renderTransferList(value: string[] = [], onChange = vi.fn()) {
	render(
		<MantineProvider>
			<TransferList
				label="People"
				data={ people }
				value={ value }
				onChange={ onChange }
				searchPlaceholder="Search people"
				nothingFoundMessage="No people found"
			/>
		</MantineProvider>,
	)
	return onChange
}

describe("TransferList", () => {
	it("moves checked available items into the selected list", async () => {
		const user = userEvent.setup()
		const onChange = renderTransferList()

		await user.click(screen.getByRole("option", { name: /Jane Doe/ }))
		await user.click(screen.getByRole("button", { name: "Transfer selected items to selected list" }))

		expect(onChange).toHaveBeenCalledWith(["jane.doe@example.com"])
	})

	it("moves checked selected items back to available", async () => {
		const user = userEvent.setup()
		const onChange = renderTransferList(["jane.doe@example.com", "sam.lee@example.com"])

		await user.click(screen.getByRole("option", { name: /Jane Doe/ }))
		await user.click(screen.getByRole("button", { name: "Transfer selected items to available list" }))

		expect(onChange).toHaveBeenCalledWith(["sam.lee@example.com"])
	})

	it("filters available options by search", async () => {
		const user = userEvent.setup()
		renderTransferList()

		const availableSearch = screen.getByRole("textbox", { name: "Search available" })
		await user.type(availableSearch, "Sam")

		expect(screen.getByRole("option", { name: /Sam Lee/ })).toBeInTheDocument()
		expect(screen.queryByRole("option", { name: /Jane Doe/ })).not.toBeInTheDocument()
	})

	it("shows nothing found when search has no matches", async () => {
		const user = userEvent.setup()
		renderTransferList()

		const availableSearch = screen.getByRole("textbox", { name: "Search available" })
		await user.type(availableSearch, "zzz")

		const availablePanel = availableSearch.closest("[data-type]")
		expect(availablePanel).toBeInstanceOf(HTMLElement)
		if(!(availablePanel instanceof HTMLElement)) return

		expect(within(availablePanel).getByText("No people found")).toBeInTheDocument()
	})

	it("does not call onChange when transferring with nothing checked", async () => {
		const user = userEvent.setup()
		const onChange = renderTransferList()

		await user.click(screen.getByRole("button", { name: "Transfer selected items to selected list" }))

		expect(onChange).not.toHaveBeenCalled()
	})

	it("keeps selected options out of the available list", () => {
		renderTransferList(["alex.kim@example.com"])

		const availableSearch = screen.getByRole("textbox", { name: "Search available" })
		const availablePanel = availableSearch.closest("[data-type]")
		expect(availablePanel).toBeInstanceOf(HTMLElement)
		if(!(availablePanel instanceof HTMLElement)) return

		expect(within(availablePanel).queryByRole("option", { name: /Alex Kim/ })).not.toBeInTheDocument()
		expect(screen.getByRole("option", { name: /Alex Kim/ })).toBeInTheDocument()
	})
})
