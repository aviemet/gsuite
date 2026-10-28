import { describe, expect, it } from "vitest"

import { coercePastedHtmlSource } from "@/frontend/components/RichTextEditor/coercePastedHtmlSource"
import { preparePastedSignatureHtml } from "@/frontend/components/RichTextEditor/preparePastedSignatureHtml"

const batterySignatureHtml = [
	"<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" role=\"presentation\"",
	" style=\"border-collapse:collapse;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a14;\">",
	"<tr>",
	"<td valign=\"top\" style=\"padding:0 16px 0 0;\">",
	"<a href=\"https://thebatterysf.com\" style=\"text-decoration:none;\">",
	"<img src=\"https://thebatterysf.com/email/the-battery-logo.png\" width=\"83\" height=\"83\"",
	" alt=\"The Battery, San Francisco\" style=\"display:block;width:83px;height:83px;border:0;\">",
	"</a></td>",
	"<td valign=\"top\" style=\"border-left:1px solid #cac2b5;padding:0 0 0 16px;\">",
	"<div style=\"font-size:14px;line-height:18px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#002c45;\">",
	"Avram Walden</div>",
	"<div style=\"font-size:11px;line-height:16px;letter-spacing:1.5px;text-transform:uppercase;color:#827f50;padding-top:3px;\">",
	"IT Manager</div>",
	"<div style=\"font-size:12px;line-height:18px;color:#313436;padding-top:10px;\">",
	"<span style=\"font-weight:bold;letter-spacing:1.5px;color:#002c45;\">THE BATTERY</span>",
	"</div></td></tr></table>",
].join("")

describe("coercePastedHtmlSource", () => {
	it("returns rendered html unchanged", () => {
		expect(coercePastedHtmlSource(batterySignatureHtml)).toBe(batterySignatureHtml)
	})

	it("unwraps html source pasted as plain text", () => {
		const escaped = `<div>${ batterySignatureHtml
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;") }</div>`

		expect(coercePastedHtmlSource(escaped)).toBe(batterySignatureHtml)
	})
})

describe("preparePastedSignatureHtml", () => {
	it("keeps signature colors, borders, and transforms", () => {
		const prepared = preparePastedSignatureHtml(batterySignatureHtml)

		expect(prepared).toContain("#002c45")
		expect(prepared).toContain("#827f50")
		expect(prepared).toContain("border-left")
		expect(prepared).toContain("letter-spacing")
		expect(prepared).toContain("text-transform")
		expect(prepared).toContain("Avram Walden")
	})

	it("keeps styles when html source was pasted as plain text", () => {
		const escaped = `<div>${ batterySignatureHtml
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;") }</div>`
		const prepared = preparePastedSignatureHtml(escaped)

		expect(prepared).toContain("#002c45")
		expect(prepared).toContain("border-left")
		expect(prepared).toContain("Avram Walden")
	})
})
