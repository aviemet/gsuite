import { MantineProvider } from "@mantine/core"
import { act, cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { type ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { AppLayout } from "@/frontend/layouts/App"
import { theme } from "@/frontend/lib/theme"

const subscribers = new Set<() => void>()

vi.mock("@/frontend/routes", () => ({
	router: {
		state: {
			location: {
				pathname: "/admin",
			},
		},
		subscribe: (_event: string, callback: () => void) => {
			subscribers.add(callback)
			return () => {
				subscribers.delete(callback)
			}
		},
	},
}))

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, to, ...props }: { children: ReactNode, to: string }) => (
		<a href={ to } { ...props }>{ children }</a>
	),
	Outlet: () => <div>main content</div>,
	useNavigate: () => vi.fn(),
}))

vi.mock("@/frontend/components/RequireWorkspaceConnection", () => ({
	useWorkspaceConnectionGate: () => ({
		hasMembership: true,
		blocksApp: false,
		redirectTo: null,
	}),
}))

vi.mock("@/frontend/components/UserMenu", () => ({
	UserMenu: () => <div>user menu</div>,
}))

vi.mock("@/frontend/components/BrandLogo", () => ({
	BrandLogo: () => <img alt="" />,
}))

afterEach(() => {
	cleanup()
	subscribers.clear()
})

describe("AppLayout", () => {
	it("closes the mobile navbar from the navbar burger and after navigation", async () => {
		const user = userEvent.setup()

		render(
			<MantineProvider theme={ theme }>
				<AppLayout />
			</MantineProvider>,
		)

		const openButtons = screen.getAllByRole("button", { name: "Open navigation" })
		expect(openButtons.length).toBeGreaterThanOrEqual(2)

		await user.click(openButtons[0])

		const closeButtons = screen.getAllByRole("button", { name: "Close navigation" })
		expect(closeButtons.length).toBeGreaterThanOrEqual(2)

		await user.click(closeButtons[closeButtons.length - 1])
		expect(screen.getAllByRole("button", { name: "Open navigation" }).length).toBeGreaterThanOrEqual(2)

		await user.click(screen.getAllByRole("button", { name: "Open navigation" })[0])
		expect(screen.getAllByRole("button", { name: "Close navigation" }).length).toBeGreaterThanOrEqual(2)

		act(() => {
			for(const subscriber of subscribers) {
				subscriber()
			}
		})

		expect(screen.getAllByRole("button", { name: "Open navigation" }).length).toBeGreaterThanOrEqual(2)
		expect(screen.queryByRole("button", { name: "Close navigation" })).not.toBeInTheDocument()
	})

	it("links to Company", () => {
		render(
			<MantineProvider theme={ theme }>
				<AppLayout />
			</MantineProvider>,
		)

		expect(screen.getByRole("link", { name: "Company" })).toHaveAttribute("href", "/admin/company")
	})
})
