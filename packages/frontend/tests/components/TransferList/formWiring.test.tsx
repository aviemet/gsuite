import { MantineProvider } from "@mantine/core"
import { useForm } from "@mantine/form"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import "@testing-library/jest-dom/vitest"

import { TransferList } from "@/frontend/components/TransferList"

afterEach(() => {
	cleanup()
})

function Harness({ initialGroupIds }: { initialGroupIds: string[] }) {
	const form = useForm({
		initialValues: { groupIds: initialGroupIds },
	})
	const groupInputProps = form.getInputProps("groupIds")

	return (
		<MantineProvider>
			<div data-testid="value">{ JSON.stringify(form.values.groupIds) }</div>
			<TransferList
				label="Groups"
				data={ [
					{ value: "engineering", label: "Engineering" },
					{ value: "product", label: "Product" },
					{ value: "sales", label: "Sales" },
				] }
				value={ groupInputProps.value }
				onChange={ groupInputProps.onChange }
			/>
		</MantineProvider>
	)
}

describe("TransferList with Mantine form getInputProps", () => {
	it("removes a chosen group without duplicating", async () => {
		const user = userEvent.setup()
		render(<Harness initialGroupIds={ ["engineering", "product"] } />)

		await user.click(screen.getByRole("button", { name: "Remove Engineering" }))

		expect(screen.getByTestId("value")).toHaveTextContent(JSON.stringify(["product"]))
		expect(screen.getByRole("button", { name: "Add Engineering" })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Remove Engineering" })).not.toBeInTheDocument()
	})

	it("adds a group once", async () => {
		const user = userEvent.setup()
		render(<Harness initialGroupIds={ ["engineering"] } />)

		await user.click(screen.getByRole("button", { name: "Add Product" }))

		expect(screen.getByTestId("value")).toHaveTextContent(
			JSON.stringify(["engineering", "product"]),
		)
	})
})
