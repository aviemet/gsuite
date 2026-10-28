import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

import { LoginForm } from "@/frontend/features/auth/LoginForm"
import { type AuthState } from "@/frontend/hooks/useAuth"

const {
	signInWithGoogle,
	invalidate,
	push,
} = vi.hoisted(() => ({
	signInWithGoogle: vi.fn(),
	invalidate: vi.fn(async () => undefined),
	push: vi.fn(),
}))

vi.mock("@/frontend/hooks/useAuth", () => ({
	useAuth: (): AuthState => ({
		user: null,
		isAuthenticated: false,
		isLoading: false,
		signInWithGoogle,
		signOut: vi.fn(),
		getAuthErrorMessage: (error: unknown) => {
			if(error && typeof error === "object" && "code" in error && error.code === "auth/popup-closed-by-user") {
				return "Sign-in was cancelled"
			}
			return "Something went wrong. Please try again"
		},
	}),
}))

vi.mock("@tanstack/react-router", () => ({
	useRouter: () => ({
		invalidate,
		history: { push },
	}),
}))

afterEach(() => {
	cleanup()
})

beforeEach(() => {
	signInWithGoogle.mockReset()
	invalidate.mockClear()
	push.mockClear()
})

function renderLoginForm(redirectTo = "/signatures") {
	render(
		<MantineProvider>
			<LoginForm redirectTo={ redirectTo } />
		</MantineProvider>,
	)
}

describe("LoginForm", () => {
	it("shows sign-in copy and a Continue with Google button", () => {
		renderLoginForm()

		expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
		expect(screen.getByText(
			"Access Signature Manager for Gmail with your corporate Google account.",
		)).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Continue with Google" })).toBeInTheDocument()
	})

	it("signs in with Google then redirects", async () => {
		const user = userEvent.setup()
		signInWithGoogle.mockResolvedValue({ uid: "1" })
		renderLoginForm()

		await user.click(screen.getByRole("button", { name: "Continue with Google" }))

		await waitFor(() => {
			expect(signInWithGoogle).toHaveBeenCalled()
			expect(invalidate).toHaveBeenCalled()
			expect(push).toHaveBeenCalledWith("/signatures")
		})
	})

	it("shows an error when Google sign-in fails", async () => {
		const user = userEvent.setup()
		signInWithGoogle.mockRejectedValue({ code: "auth/popup-closed-by-user" })
		renderLoginForm("/")

		await user.click(screen.getByRole("button", { name: "Continue with Google" }))

		expect(await screen.findByText("Sign-in was cancelled")).toBeInTheDocument()
		expect(push).not.toHaveBeenCalled()
	})
})
