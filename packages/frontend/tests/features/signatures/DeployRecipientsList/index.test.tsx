import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import "@testing-library/jest-dom/vitest"

import { DeployRecipientsList } from "@/frontend/features/signatures/DeployRecipientsList"
import { theme } from "@/frontend/lib/theme"

afterEach(() => {
	cleanup()
})

describe("DeployRecipientsList", () => {
	it("shows the mailbox count and each recipient", () => {
		render(
			<MantineProvider theme={ theme }>
				<DeployRecipientsList
					recipients={ [
						{ email: "jane.doe@example.com", displayName: "Jane Doe" },
						{ email: "alex.kim@example.com", displayName: "Alex Kim" },
					] }
				/>
			</MantineProvider>,
		)

		expect(screen.getByText("Will apply to 2 mailboxes")).toBeInTheDocument()
		expect(screen.getByText("Jane Doe")).toBeInTheDocument()
		expect(screen.getByText("(jane.doe@example.com)")).toBeInTheDocument()
		expect(screen.getByText("Alex Kim")).toBeInTheDocument()
	})

	it("shows an empty state when nobody matches", () => {
		render(
			<MantineProvider theme={ theme }>
				<DeployRecipientsList recipients={ [] } />
			</MantineProvider>,
		)

		expect(screen.getByText("Will apply to 0 mailboxes")).toBeInTheDocument()
		expect(screen.getByText("No mailboxes currently match")).toBeInTheDocument()
	})
})
