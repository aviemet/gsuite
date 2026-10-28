import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import "@testing-library/jest-dom/vitest"

import { AssignmentSummaryBadge } from "@/frontend/features/signatures/AssignmentSummaryBadge"

afterEach(() => {
	cleanup()
})

describe("AssignmentSummaryBadge", () => {
	it("renders a plain badge without tooltip for a single named target", () => {
		render(
			<MantineProvider>
				<AssignmentSummaryBadge
					summary={ {
						text: "Engineering",
						details: [{ kind: "group", label: "Engineering" }],
						hasDetailTooltip: false,
					} }
				/>
			</MantineProvider>,
		)

		expect(screen.getByText("Engineering")).toBeInTheDocument()
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
	})

	it("shows detail badges in a tooltip for multi-target summaries", async () => {
		const user = userEvent.setup()
		render(
			<MantineProvider>
				<AssignmentSummaryBadge
					summary={ {
						text: "3 groups",
						details: [
							{ kind: "group", label: "Engineering" },
							{ kind: "group", label: "Product" },
							{ kind: "group", label: "Marketing" },
						],
						hasDetailTooltip: true,
					} }
				/>
			</MantineProvider>,
		)

		await user.hover(screen.getByText("3 groups"))

		const tooltip = await screen.findByRole("tooltip")
		expect(tooltip).toHaveStyle({
			"--tooltip-radius": "var(--mantine-radius-md)",
		})
		expect(tooltip.className).toMatch(/tooltip/)
		expect(screen.getByText("Engineering")).toBeInTheDocument()
		expect(screen.getByText("Product")).toBeInTheDocument()
		expect(screen.getByText("Marketing")).toBeInTheDocument()
	})
})
