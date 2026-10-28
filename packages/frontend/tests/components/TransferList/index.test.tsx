import { MantineProvider } from "@mantine/core"
import { useForm } from "@mantine/form"
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
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

const groups = [
	{ value: "engineering", label: "Engineering" },
	{ value: "product", label: "Product" },
	{ value: "marketing", label: "Marketing" },
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

function ControlledTransferList({
	initialValue,
	data = groups,
	label = "Groups",
}: {
	initialValue: string[]
	data?: typeof groups
	label?: string
}) {
	const [value, setValue] = useState(initialValue)

	return (
		<MantineProvider>
			<div data-testid="value">{ JSON.stringify(value) }</div>
			<TransferList
				label={ label }
				data={ data }
				value={ value }
				onChange={ setValue }
			/>
		</MantineProvider>
	)
}

function FormWiredTransferList({ initialGroupIds }: { initialGroupIds: string[] }) {
	const form = useForm({
		initialValues: { groupIds: initialGroupIds },
	})

	return (
		<MantineProvider>
			<div data-testid="value">{ JSON.stringify(form.values.groupIds) }</div>
			<TransferList
				label="Groups"
				data={ groups }
				value={ form.values.groupIds }
				onChange={ (nextValue) => form.setFieldValue("groupIds", nextValue) }
			/>
		</MantineProvider>
	)
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

	it("does not add a disabled choice", async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		render(
			<MantineProvider>
				<TransferList
					label="People"
					data={ [
						{
							value: "jane.doe@example.com",
							label: "Jane Doe (jane.doe@example.com)",
							disabled: true,
							disabledReason: "Used by Engineering Sig",
						},
						{ value: "sam.lee@example.com", label: "Sam Lee (sam.lee@example.com)" },
					] }
					value={ [] }
					onChange={ onChange }
				/>
			</MantineProvider>,
		)

		expect(screen.getByText("Used by Engineering Sig")).toBeInTheDocument()
		await user.click(screen.getByRole("button", { name: "Add Jane Doe (jane.doe@example.com)" }))
		expect(onChange).not.toHaveBeenCalled()
	})
})

describe("TransferList controlled regression", () => {
	it("moves a chosen group back to choices after state updates", async () => {
		const user = userEvent.setup()
		render(<ControlledTransferList initialValue={ ["engineering", "product"] } />)

		await user.click(screen.getByRole("button", { name: "Remove Engineering" }))

		expect(screen.getByTestId("value")).toHaveTextContent(JSON.stringify(["product"]))
		expect(screen.getByRole("button", { name: "Add Engineering" })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Remove Engineering" })).not.toBeInTheDocument()
		expect(screen.getAllByRole("button", { name: "Remove Product" })).toHaveLength(1)
	})

	it("does not clone chosen rows when value contains duplicates", async () => {
		const user = userEvent.setup()
		render(
			<ControlledTransferList
				initialValue={ ["engineering", "product", "engineering", "marketing", "product"] }
			/>,
		)

		expect(screen.getAllByRole("button", { name: "Remove Engineering" })).toHaveLength(1)
		expect(screen.getAllByRole("button", { name: "Remove Product" })).toHaveLength(1)
		expect(screen.getAllByRole("button", { name: "Remove Marketing" })).toHaveLength(1)

		await user.click(screen.getByRole("button", { name: "Remove Engineering" }))

		expect(screen.getByTestId("value")).toHaveTextContent(
			JSON.stringify(["product", "marketing"]),
		)
		expect(screen.getByRole("button", { name: "Add Engineering" })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Remove Engineering" })).not.toBeInTheDocument()
		expect(screen.getAllByRole("button", { name: "Remove Product" })).toHaveLength(1)
		expect(screen.getAllByRole("button", { name: "Remove Marketing" })).toHaveLength(1)
	})

	it("adds a group once through form setFieldValue wiring", async () => {
		const user = userEvent.setup()
		render(<FormWiredTransferList initialGroupIds={ ["engineering"] } />)

		await user.click(screen.getByRole("button", { name: "Add Product" }))

		expect(screen.getByTestId("value")).toHaveTextContent(
			JSON.stringify(["engineering", "product"]),
		)
		expect(screen.queryByRole("button", { name: "Add Product" })).not.toBeInTheDocument()
		expect(screen.getAllByRole("button", { name: "Remove Product" })).toHaveLength(1)
	})

	it("removes through form setFieldValue wiring without leaving duplicates", async () => {
		const user = userEvent.setup()
		render(
			<FormWiredTransferList
				initialGroupIds={ ["engineering", "product", "engineering"] }
			/>,
		)

		await user.click(screen.getByRole("button", { name: "Remove Engineering" }))

		expect(screen.getByTestId("value")).toHaveTextContent(JSON.stringify(["product"]))
		expect(screen.getByRole("button", { name: "Add Engineering" })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Remove Engineering" })).not.toBeInTheDocument()
	})
})
