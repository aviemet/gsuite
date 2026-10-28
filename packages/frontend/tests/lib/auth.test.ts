import { describe, expect, it } from "vitest"

import { getAuthErrorMessage, sanitizeRedirectPath } from "@/frontend/lib/auth"

describe("sanitizeRedirectPath", () => {
	it("keeps internal paths", () => {
		expect(sanitizeRedirectPath("/signatures")).toBe("/signatures")
		expect(sanitizeRedirectPath("/settings?tab=1")).toBe("/settings?tab=1")
	})

	it("rejects external and protocol-relative urls", () => {
		expect(sanitizeRedirectPath("https://evil.example")).toBe("/")
		expect(sanitizeRedirectPath("//evil.example")).toBe("/")
		expect(sanitizeRedirectPath("login")).toBe("/")
		expect(sanitizeRedirectPath(undefined)).toBe("/")
	})
})

describe("getAuthErrorMessage", () => {
	it("maps known firebase auth codes", () => {
		expect(getAuthErrorMessage({ code: "auth/popup-closed-by-user" })).toBe("Sign-in was cancelled")
		expect(getAuthErrorMessage({ code: "auth/popup-blocked" })).toBe(
			"Pop-up was blocked. Allow pop-ups and try again",
		)
	})

	it("falls back for unknown errors", () => {
		expect(getAuthErrorMessage({ code: "auth/something-new" })).toBe(
			"Something went wrong (auth/something-new). Please try again",
		)
		expect(getAuthErrorMessage(new Error("nope"))).toBe("Something went wrong. Please try again")
	})
})

