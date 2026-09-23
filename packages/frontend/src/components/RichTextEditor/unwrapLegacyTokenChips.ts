const TOKEN_TEXT_PATTERN = /^\{\{\w+(?:\|"[^"]*")?\}\}$/

export function unwrapLegacyTokenChips(html: string): string {
	const parsed = new DOMParser().parseFromString(html, "text/html")

	for(const span of Array.from(parsed.querySelectorAll("span.mceNonEditable"))) {
		if(!(span instanceof HTMLElement)) {
			continue
		}

		const dataContent = span.getAttribute("data-mce-content")
		const text = dataContent ?? span.textContent ?? ""
		if(!TOKEN_TEXT_PATTERN.test(text)) {
			continue
		}

		const style = span.getAttribute("style")
		if(style && style.trim().length > 0) {
			const wrapper = parsed.createElement("span")
			wrapper.setAttribute("style", style)
			wrapper.textContent = text
			span.replaceWith(wrapper)
			continue
		}

		span.replaceWith(parsed.createTextNode(text))
	}

	return parsed.body.innerHTML
}
