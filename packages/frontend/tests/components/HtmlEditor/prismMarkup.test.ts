import Prism from "prismjs"
import { describe, expect, it } from "vitest"

import "prismjs/components/prism-markup"

describe("prism markup registration", () => {
	it("registers markup after the core Prism import", () => {
		expect(Prism.languages.markup).toBeDefined()
	})
})
