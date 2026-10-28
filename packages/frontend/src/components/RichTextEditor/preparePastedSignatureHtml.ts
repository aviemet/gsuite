import { coercePastedHtmlSource } from "./coercePastedHtmlSource"
import { normalizePastedSignatureHtml } from "./normalizePastedSignatureHtml"

export function preparePastedSignatureHtml(html: string): string {
	return normalizePastedSignatureHtml(coercePastedHtmlSource(html))
}
