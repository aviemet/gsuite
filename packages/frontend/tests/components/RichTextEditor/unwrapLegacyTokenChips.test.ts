import { describe, expect, it } from "vitest"

import { unwrapLegacyTokenChips } from "@/frontend/components/RichTextEditor/unwrapLegacyTokenChips"

describe("unwrapLegacyTokenChips", () => {
	it("unwraps plain token chips to text", () => {
		const html = '<p><span class="mceNonEditable" data-mce-content="{{name}}">{{name}}</span></p>'
		expect(unwrapLegacyTokenChips(html)).toBe("<p>{{name}}</p>")
	})

	it("preserves chip styles on a wrapping span", () => {
		const html = '<p><span class="mceNonEditable" style="color: #e64980;" data-mce-content="{{email}}">{{email}}</span></p>'
		expect(unwrapLegacyTokenChips(html)).toBe('<p><span style="color: #e64980;">{{email}}</span></p>')
	})

	it("leaves non-token noneditables alone", () => {
		const html = '<p><span class="mceNonEditable">not a token</span></p>'
		expect(unwrapLegacyTokenChips(html)).toBe(html)
	})

	it("supports fallback token syntax", () => {
		const html = '<span class="mceNonEditable" data-mce-content=\'{{title|"Engineer"}}\'>{{title|"Engineer"}}</span>'
		expect(unwrapLegacyTokenChips(html)).toBe('{{title|"Engineer"}}')
	})
})
