function looksLikeHtmlSource(text: string): boolean {
	if(!/^<[a-z!/?]/i.test(text)) {
		return false
	}

	return /<\/[a-z][\w:-]*>/i.test(text) || /^<(img|br|hr)\b/i.test(text)
}

function hasRenderedSignatureMarkup(root: HTMLElement): boolean {
	return Boolean(root.querySelector("table, img, a[href], font, td, th, [style]"))
}

export function coercePastedHtmlSource(html: string): string {
	const parsed = new DOMParser().parseFromString(html, "text/html")
	if(hasRenderedSignatureMarkup(parsed.body)) {
		return html
	}

	const text = parsed.body.textContent?.trim() ?? ""
	if(!looksLikeHtmlSource(text)) {
		return html
	}

	const asHtml = new DOMParser().parseFromString(text, "text/html")
	if(!hasRenderedSignatureMarkup(asHtml.body) && !asHtml.body.querySelector("div, span, p")) {
		return html
	}

	return text
}
