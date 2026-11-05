import { describe, expect, it } from "vitest"

import { formatHtmlWithDirectives } from "@/frontend/lib/formatHtmlWithDirectives"

describe("formatHtmlWithDirectives", () => {
	it("indents nested block elements", () => {
		const formatted = formatHtmlWithDirectives("<table><tbody><tr><td><div>{{fullName}}</div></td></tr></tbody></table>")

		expect(formatted).toBe([
			"<table>",
			"  <tbody>",
			"    <tr>",
			"      <td>",
			"        <div>{{fullName}}</div>",
			"      </td>",
			"    </tr>",
			"  </tbody>",
			"</table>",
		].join("\n"))
	})

	it("keeps long inline content and directives on one line", () => {
		const longText = "A legal disclaimer that is comfortably longer than one hundred characters so it would previously wrap"
		const line = `<div>{{#if mobile}}<a href="tel:{{mobile}}">{{mobile}}</a>{{else}}<span style="color: #888888;">${ longText }</span>{{/if}}</div>`

		expect(formatHtmlWithDirectives(line)).toBe(line)
	})
})
