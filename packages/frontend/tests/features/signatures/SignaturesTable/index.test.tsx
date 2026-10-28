import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { type ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { SignaturesTable } from "@/frontend/features/signatures/SignaturesTable"
import { type TemplateAssignmentSummary } from "@/frontend/features/signatures/summarizeTemplateAssignments"
import { theme } from "@/frontend/lib/theme"
import { type Template } from "@/frontend/types/firebase"

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children }: { children: ReactNode }) => <a href="/">{ children }</a>,
	useRouter: () => ({
		navigate: vi.fn(),
	}),
}))

afterEach(() => {
	cleanup()
})

function enableDataTableMediaQueries() {
	window.matchMedia = ((query: string) => ({
		matches: true,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	})) as typeof window.matchMedia
}

const professional: Template = {
	id: "template-1",
	name: "Professional Signature",
	content: "<p><strong>{{fullName}}</strong></p><p>{{email}}</p>",
	variables: ["fullName", "email"],
	conditions: [],
	isScheduled: false,
	createdBy: "admin",
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
	isActive: true,
	customerId: "customer-1",
}

const marketing: Template = {
	...professional,
	id: "template-2",
	name: "Marketing Signature",
	content: "<p>Marketing</p>",
	isScheduled: true,
}

const summaries = new Map<string, TemplateAssignmentSummary>([
	["template-1", {
		text: "Engineering",
		details: [{ kind: "group", label: "Engineering" }],
		hasDetailTooltip: false,
	}],
	["template-2", {
		text: "Unassigned",
		details: [],
		hasDetailTooltip: false,
	}],
])

function renderTable(templates: Template[] = [professional, marketing]) {
	enableDataTableMediaQueries()
	return render(
		<MantineProvider theme={ theme }>
			<SignaturesTable
				templates={ templates }
				assignmentSummaries={ summaries }
				loading={ false }
			/>
		</MantineProvider>,
	)
}

describe("SignaturesTable", () => {
	it("expands a row with the chevron to show the rendered signature preview", async () => {
		const user = userEvent.setup()
		renderTable([professional])

		expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument()

		await user.click(screen.getByRole("button", { name: "Expand Professional Signature" }))

		expect(await screen.findByText("Jane Doe")).toBeInTheDocument()
		expect(screen.getByText("jane.doe@example.com")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Collapse Professional Signature" }))
			.toHaveAttribute("aria-expanded", "true")
	})

	it("expands and collapses all signatures from the header control", async () => {
		const user = userEvent.setup()
		renderTable()

		await user.click(screen.getByRole("button", { name: "Expand all signatures" }))

		expect(screen.getByRole("button", { name: "Collapse Professional Signature" }))
			.toHaveAttribute("aria-expanded", "true")
		expect(screen.getByRole("button", { name: "Collapse Marketing Signature" }))
			.toHaveAttribute("aria-expanded", "true")
		expect(screen.getByRole("button", { name: "Collapse all signatures" }))
			.toHaveAttribute("aria-expanded", "true")

		await user.click(screen.getByRole("button", { name: "Collapse all signatures" }))

		expect(screen.getByRole("button", { name: "Expand Professional Signature" }))
			.toHaveAttribute("aria-expanded", "false")
		expect(screen.getByRole("button", { name: "Expand Marketing Signature" }))
			.toHaveAttribute("aria-expanded", "false")
	})

	it("sorts by name when the Name header is clicked", async () => {
		const user = userEvent.setup()
		renderTable()

		const nameHeader = screen.getByRole("button", { name: /Name/i })
		await user.click(nameHeader)

		const bodyRows = within(screen.getByRole("table")).getAllByRole("row").slice(1)
		expect(within(bodyRows[0]!).getByText("Professional Signature")).toBeInTheDocument()
		expect(within(bodyRows[1]!).getByText("Marketing Signature")).toBeInTheDocument()
	})
})
