import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import "@testing-library/jest-dom/vitest"

import { APP_NAME } from "@/frontend/lib/appName"
import { CONTACT_EMAIL } from "@/frontend/lib/legal"
import { SupportPage } from "@/frontend/pages/Support"

afterEach(() => {
	cleanup()
})

describe("SupportPage", () => {
	it("shows contact email and setup guidance", () => {
		render(<SupportPage />)

		expect(screen.getByRole("heading", { name: "Support" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: CONTACT_EMAIL })).toHaveAttribute(
			"href",
			`mailto:${ CONTACT_EMAIL }`,
		)
		expect(screen.getByText(new RegExp(`Help for ${ APP_NAME }`))).toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "Common setup steps" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy")
		expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "/terms")
	})
})
