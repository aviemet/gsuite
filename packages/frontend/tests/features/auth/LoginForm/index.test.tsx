import "@testing-library/jest-dom/vitest"

import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { LoginForm } from "@/frontend/features/auth/LoginForm"
import { type AuthState } from "@/frontend/hooks/useAuth"

const {
	signInWithEmail,
	signInWithGoogle,
	invalidate,
	push,
} = vi.hoisted(() => ({
	signInWithEmail: vi.fn(),
	signInWithGoogle: vi.fn(),
	invalidate: vi.fn(async () => undefined),
	push: vi.fn(),
}))

vi.mock("@/frontend/hooks/useAuth", () => ({
	useAuth: (): AuthState => ({
		user: null,
		isAuthenticated: false,
		isLoading: false,
		signInWithEmail,
		signInWithGoogle,
		signOut: vi.fn(),
		getAuthErrorMessage: (error: unknown) => {
			if(error && typeof error === "object" && "code" in error && error.code === "auth/invalid-credential") {
				return "Invalid email or password"
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
	signInWithEmail.mockReset()
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
	it("signs in with email and password then redirects", async () => {
		const user = userEvent.setup()
		signInWithEmail.mockResolvedValue({ uid: "1" })
		renderLoginForm()

		await user.type(screen.getByLabelText("Email"), "test@test.com")
		await user.type(screen.getByLabelText("Password"), "password")
		await user.click(screen.getByRole("button", { name: "Sign in" }))

		await waitFor(() => {
			expect(signInWithEmail).toHaveBeenCalledWith("test@test.com", "password")
			expect(invalidate).toHaveBeenCalled()
			expect(push).toHaveBeenCalledWith("/signatures")
		})
	})

	it("signs in with Google", async () => {
		const user = userEvent.setup()
		signInWithGoogle.mockResolvedValue({ uid: "1" })
		renderLoginForm("/")

		await user.click(screen.getByRole("button", { name: "Continue with Google" }))

		await waitFor(() => {
			expect(signInWithGoogle).toHaveBeenCalled()
			expect(push).toHaveBeenCalledWith("/")
		})
	})

	it("shows an error when email sign-in fails", async () => {
		const user = userEvent.setup()
		signInWithEmail.mockRejectedValue({ code: "auth/invalid-credential" })
		renderLoginForm()

		await user.type(screen.getByLabelText("Email"), "test@test.com")
		await user.type(screen.getByLabelText("Password"), "wrong")
		await user.click(screen.getByRole("button", { name: "Sign in" }))

		expect(await screen.findByText("Invalid email or password")).toBeInTheDocument()
		expect(push).not.toHaveBeenCalled()
	})
})
