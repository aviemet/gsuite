import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { PublicLayout } from "@/frontend/layouts/Public"
import { CONTACT_EMAIL } from "@/frontend/lib/legal"

const authState = vi.hoisted(() => ({
	isAuthenticated: false,
}))

vi.mock("@/frontend/hooks/useAuth", () => ({
	useAuth: () => authState,
}))

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, to, ...props }: { children: React.ReactNode, to: string }) => (
		<a href={ to } { ...props }>{ children }</a>
	),
	Outlet: () => null,
}))

afterEach(() => {
	cleanup()
	authState.isAuthenticated = false
})

describe("PublicLayout", () => {
	it("shows Sign in when signed out", () => {
		render(
			<MantineProvider>
				<PublicLayout>
					<div>content</div>
				</PublicLayout>
			</MantineProvider>,
		)

		expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login")
		expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy")
		expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms")
		expect(screen.getByRole("link", { name: CONTACT_EMAIL })).toHaveAttribute(
			"href",
			`mailto:${ CONTACT_EMAIL }`,
		)
	})

	it("shows Go to dashboard when signed in", () => {
		authState.isAuthenticated = true
		render(
			<MantineProvider>
				<PublicLayout>
					<div>content</div>
				</PublicLayout>
			</MantineProvider>,
		)

		expect(screen.getByRole("link", { name: "Go to dashboard" })).toHaveAttribute("href", "/admin")
		expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument()
	})
})
