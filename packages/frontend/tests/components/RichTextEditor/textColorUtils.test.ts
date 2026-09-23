import { describe, expect, it } from "vitest"

import {
	cssColorToHex,
	hexDigitsFromColor,
	listIncludesColor,
	normalizeHex,
	parseStoredSwatches,
	stripLeadingHashes,
} from "@/frontend/components/RichTextEditor/textColorUtils"

describe("normalizeHex", () => {
	it("normalizes 6-digit hex to lowercase", () => {
		expect(normalizeHex("#E64980")).toBe("#e64980")
	})

	it("expands 3-digit hex", () => {
		expect(normalizeHex("#f0c")).toBe("#ff00cc")
	})

	it("truncates 8-digit hex to 6 digits", () => {
		expect(normalizeHex("#e64980ff")).toBe("#e64980")
	})

	it("converts rgb() to hex", () => {
		expect(normalizeHex("rgb(230, 73, 128)")).toBe("#e64980")
	})

	it("returns null for invalid colors", () => {
		expect(normalizeHex("not-a-color")).toBeNull()
		expect(normalizeHex("")).toBeNull()
	})
})

describe("cssColorToHex", () => {
	it("passes through hex values", () => {
		expect(cssColorToHex("#abc")).toBe("#abc")
	})

	it("parses rgba ignoring alpha", () => {
		expect(cssColorToHex("rgba(1, 2, 3, 0.5)")).toBe("#010203")
	})
})

describe("parseStoredSwatches", () => {
	it("returns empty for non-json", () => {
		expect(parseStoredSwatches("not-json")).toEqual([])
		expect(parseStoredSwatches(undefined)).toEqual([])
	})

	it("keeps unique custom hex values and drops defaults", () => {
		expect(parseStoredSwatches(JSON.stringify(["#112233", "#112233", "#25262b", 12, "bad"]))).toEqual([
			"#112233",
		])
	})
})

describe("hexDigitsFromColor", () => {
	it("returns digits without hash for valid colors", () => {
		expect(hexDigitsFromColor("#e64980")).toBe("e64980")
	})

	it("strips leading hashes from freeform input", () => {
		expect(hexDigitsFromColor("##abc")).toBe("abc")
	})
})

describe("stripLeadingHashes", () => {
	it("removes leading hashes and trims", () => {
		expect(stripLeadingHashes("  ##ff00aa  ")).toBe("ff00aa")
	})
})

describe("listIncludesColor", () => {
	it("matches equivalent hex forms", () => {
		expect(listIncludesColor(["#e64980"], "rgb(230, 73, 128)")).toBe(true)
		expect(listIncludesColor(["#e64980"], "#00ff00")).toBe(false)
	})
})
