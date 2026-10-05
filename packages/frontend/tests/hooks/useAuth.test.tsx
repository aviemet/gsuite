import { afterEach, describe, expect, it, vi } from "vitest"

import "@testing-library/jest-dom/vitest"

const { onAuthStateChanged } = vi.hoisted(() => ({
	onAuthStateChanged: vi.fn(),
}))

vi.mock("firebase/auth", () => ({
	onAuthStateChanged,
}))

vi.mock("@/frontend/lib/firebase", () => ({
	initializeFirebase: vi.fn(),
	getFirebaseAuth: vi.fn(() => ({ name: "auth" })),
}))

vi.mock("@/frontend/lib/auth", () => ({
	getAuthErrorMessage: vi.fn(),
	signInWithEmail: vi.fn(),
	signInWithGoogle: vi.fn(),
	signOutCurrentUser: vi.fn(),
}))

afterEach(() => {
	vi.resetModules()
	onAuthStateChanged.mockReset()
})

describe("AuthProvider", () => {
	it("exposes the signed-in user after the first auth callback", async () => {
		const { render, screen, waitFor, cleanup } = await import("@testing-library/react")
		const { AuthProvider, useAuth } = await import("@/frontend/hooks/useAuth")

		onAuthStateChanged.mockImplementation((_auth, callback: (user: { uid: string } | null) => void) => {
			callback({ uid: "user-1" })
			return vi.fn()
		})

		function Probe() {
			const auth = useAuth()
			return (
				<div>
					<span>{ auth.isLoading ? "loading" : "ready" }</span>
					<span>{ auth.isAuthenticated ? "signed-in" : "signed-out" }</span>
					<span>{ auth.user?.uid }</span>
				</div>
			)
		}

		render(
			<AuthProvider>
				<Probe />
			</AuthProvider>,
		)

		await waitFor(() => {
			expect(screen.getByText("ready")).toBeInTheDocument()
			expect(screen.getByText("signed-in")).toBeInTheDocument()
			expect(screen.getByText("user-1")).toBeInTheDocument()
		})

		cleanup()
	})

	it("exposes a signed-out state when there is no user", async () => {
		const { render, screen, waitFor, cleanup } = await import("@testing-library/react")
		const { AuthProvider, useAuth } = await import("@/frontend/hooks/useAuth")

		onAuthStateChanged.mockImplementation((_auth, callback: (user: null) => void) => {
			callback(null)
			return vi.fn()
		})

		function Probe() {
			const auth = useAuth()
			return <span>{ auth.isAuthenticated ? "signed-in" : "signed-out" }</span>
		}

		render(
			<AuthProvider>
				<Probe />
			</AuthProvider>,
		)

		await waitFor(() => {
			expect(screen.getByText("signed-out")).toBeInTheDocument()
		})

		cleanup()
	})
})
