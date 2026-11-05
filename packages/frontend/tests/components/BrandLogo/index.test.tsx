import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import "@testing-library/jest-dom/vitest"

import { BrandLogo } from "@/frontend/components/BrandLogo"

afterEach(() => {
	cleanup()
})

describe("BrandLogo", () => {
	it("renders the SuiteOcean logo image", () => {
		const { container } = render(<BrandLogo className="mark" size={ 32 } />)
		const image = container.querySelector("img")

		expect(image).toBeInTheDocument()
		expect(image).toHaveAttribute("width", "32")
		expect(image).toHaveAttribute("height", "32")
		expect(image).toHaveClass("mark")
		expect(image?.getAttribute("src")).toContain("suiteocean-logo")
	})
})
