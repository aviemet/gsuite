import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { APP_NAME } from "@/frontend/lib/appName"
import { HomePage } from "@/frontend/pages/Home"

vi.mock("@/frontend/hooks/useAuth", () => ({
	useAuth: () => ({ isAuthenticated: false }),
}))

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, to, ...props }: { children: React.ReactNode, to: string }) => (
		<a href={ to } { ...props }>{ children }</a>
	),
}))

afterEach(() => {
	cleanup()
})

describe("HomePage", () => {
	it("presents the product and a Get started call to action", () => {
		render(
			<MantineProvider>
				<HomePage />
			</MantineProvider>,
		)

		expect(screen.getByText(APP_NAME)).toBeInTheDocument()
		expect(screen.getByRole("heading", {
			name: "Consistent Gmail signatures for your whole Google Workspace",
		})).toBeInTheDocument()
		expect(screen.getAllByRole("link", { name: "Get started" }).length).toBeGreaterThan(0)
		expect(screen.getByRole("heading", { name: "What it does" })).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "How it works" })).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "Permissions and access" })).toBeInTheDocument()
	})
})
