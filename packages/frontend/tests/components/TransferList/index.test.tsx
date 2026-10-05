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

function panelFor(searchName: string) {
	const search = screen.getByRole("textbox", { name: searchName })
	const panel = search.closest("[data-type]")
	expect(panel).toBeInstanceOf(HTMLElement)
	if(!(panel instanceof HTMLElement)) throw new Error(`Missing panel for ${ searchName }`)
	return panel
}

describe("TransferList", () => {
	it("labels the columns as choices and chosen", () => {
		renderTransferList()

		expect(screen.getByText("Choices")).toBeInTheDocument()
		expect(screen.getByText("Chosen")).toBeInTheDocument()
	})

	it("moves a choice into chosen as soon as its button is clicked", async () => {
		const user = userEvent.setup()
		const onChange = renderTransferList()

		await user.click(screen.getByRole("button", { name: "Add Jane Doe (jane.doe@example.com)" }))

		expect(onChange).toHaveBeenCalledWith(["jane.doe@example.com"])
	})

	it("moves a chosen item back to choices as soon as its button is clicked", async () => {
		const user = userEvent.setup()
		const onChange = renderTransferList(["jane.doe@example.com", "sam.lee@example.com"])

		await user.click(screen.getByRole("button", { name: "Remove Jane Doe (jane.doe@example.com)" }))

		expect(onChange).toHaveBeenCalledWith(["sam.lee@example.com"])
	})

	it("filters choices by search", async () => {
		const user = userEvent.setup()
		renderTransferList()

		const choicesSearch = screen.getByRole("textbox", { name: "Search choices" })
		await user.type(choicesSearch, "Sam")

		expect(screen.getByRole("button", { name: "Add Sam Lee (sam.lee@example.com)" })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /Add Jane Doe/ })).not.toBeInTheDocument()
	})

	it("shows nothing found when search has no matches", async () => {
		const user = userEvent.setup()
		renderTransferList()

		const choicesSearch = screen.getByRole("textbox", { name: "Search choices" })
		await user.type(choicesSearch, "zzz")

		expect(within(panelFor("Search choices")).getByText("No people found")).toBeInTheDocument()
	})

	it("clears every chosen item", async () => {
		const user = userEvent.setup()
		const onChange = renderTransferList(["jane.doe@example.com", "sam.lee@example.com"])

		await user.click(screen.getByRole("button", { name: "Clear all people" }))

		expect(onChange).toHaveBeenCalledWith([])
	})

	it("disables clear all when nothing is chosen", () => {
		renderTransferList()

		expect(screen.getByRole("button", { name: "Clear all people" })).toBeDisabled()
		expect(within(panelFor("Search chosen")).getByText("Nothing chosen")).toBeInTheDocument()
	})

	it("keeps chosen options out of the choices list", () => {
		renderTransferList(["alex.kim@example.com"])

		const choicesPanel = panelFor("Search choices")
		expect(within(choicesPanel).queryByRole("button", { name: /Alex Kim/ })).not.toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Remove Alex Kim (alex.kim@example.com)" })).toBeInTheDocument()
	})

	it("shows an empty choices message when every option is chosen", () => {
		renderTransferList(people.map((person) => person.value))

		expect(within(panelFor("Search choices")).getByText("No choices left")).toBeInTheDocument()
	})
})
