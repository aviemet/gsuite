import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import "@testing-library/jest-dom/vitest"

import { APP_NAME } from "@/frontend/lib/appName"
import {
	CONTACT_EMAIL,
	EFFECTIVE_DATE,
	LEGAL_ENTITY_NAME,
} from "@/frontend/lib/legal"
import { PrivacyPage } from "@/frontend/pages/Privacy"

afterEach(() => {
	cleanup()
})

describe("PrivacyPage", () => {
	it("shows placeholders and the Google Limited Use disclosure", () => {
		render(<PrivacyPage />)

		expect(screen.getByRole("heading", { name: "Privacy Policy" })).toBeInTheDocument()
		expect(screen.getByText(`Effective date: ${ EFFECTIVE_DATE }`)).toBeInTheDocument()
		expect(screen.getByText(new RegExp(LEGAL_ENTITY_NAME.replace(/[[\]]/g, "\\$&")))).toBeInTheDocument()
		expect(screen.getByText(
			`${ APP_NAME }'s use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements.`,
		)).toBeInTheDocument()
		expect(screen.getByText(`Questions about this policy: ${ CONTACT_EMAIL }.`)).toBeInTheDocument()
	})
})
