import { cleanup, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { invalidate } = vi.hoisted(() => ({
	invalidate: vi.fn(async () => undefined),
}))

vi.mock("@/frontend/routes", () => ({
	router: {
		invalidate,
	},
}))

afterEach(() => {
	cleanup()
})

beforeEach(() => {
	invalidate.mockClear()
})

describe("useRouterAuthSync", () => {
	it("does not invalidate while auth is loading", async () => {
		const { useRouterAuthSync } = await import("@/frontend/hooks/useRouterAuthSync")

		function Probe() {
			useRouterAuthSync(true, false)
			return null
		}

		render(<Probe />)
		expect(invalidate).not.toHaveBeenCalled()
	})

	it("invalidates when auth settles and when authentication changes", async () => {
		const { useRouterAuthSync } = await import("@/frontend/hooks/useRouterAuthSync")

		function Probe({ isLoading, isAuthenticated }: { isLoading: boolean, isAuthenticated: boolean }) {
			useRouterAuthSync(isLoading, isAuthenticated)
			return null
		}

		const view = render(<Probe isLoading={ false } isAuthenticated={ false } />)
		expect(invalidate).toHaveBeenCalledTimes(1)

		view.rerender(<Probe isLoading={ false } isAuthenticated={ true } />)
		expect(invalidate).toHaveBeenCalledTimes(2)
	})
})
