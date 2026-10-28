import { describe, expect, it } from "vitest"

import { uniquePreserveOrder } from "../src/uniquePreserveOrder"

describe("uniquePreserveOrder", () => {
	it("keeps first occurrence order and drops later duplicates", () => {
		expect(uniquePreserveOrder(["engineering", "product", "engineering", "marketing", "product"]))
			.toEqual(["engineering", "product", "marketing"])
	})

	it("returns a new empty array for empty input", () => {
		expect(uniquePreserveOrder([])).toEqual([])
	})
})
