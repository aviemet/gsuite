interface InheritedTextStyles {
	fontFamily: string | null
	color: string | null
	backgroundColor: string | null
	textTransform: string | null
}

const INHERITED_STYLE_PROPERTIES = new Set([
	"font-family",
	"font-size",
	"color",
	"background-color",
	"text-transform",
	"font-weight",
	"font-style",
	"letter-spacing",
	"line-height",
	"text-align",
])

const BOX_STYLE_PROPERTIES = new Set([
	"margin",
	"margin-top",
	"margin-right",
	"margin-bottom",
	"margin-left",
	"padding",
	"padding-top",
	"padding-right",
	"padding-bottom",
	"padding-left",
	"border",
	"border-top",
	"border-right",
	"border-bottom",
	"border-left",
	"border-width",
	"border-style",
	"border-color",
	"border-top-width",
	"border-top-style",
	"border-top-color",
	"border-right-width",
	"border-right-style",
	"border-right-color",
	"border-bottom-width",
	"border-bottom-style",
	"border-bottom-color",
	"border-left-width",
	"border-left-style",
	"border-left-color",
])

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA"])

const BLOCK_CHILD_TAGS = new Set([
	"ADDRESS",
	"ARTICLE",
	"ASIDE",
	"BLOCKQUOTE",
	"DIV",
	"DL",
	"FIELDSET",
	"FIGURE",
	"FOOTER",
	"FORM",
	"H1",
	"H2",
	"H3",
	"H4",
	"H5",
	"H6",
	"HEADER",
	"HR",
	"MAIN",
	"NAV",
	"OL",
	"P",
	"PRE",
	"SECTION",
	"TABLE",
	"UL",
])

function isHtmlElement(node: Node): node is HTMLElement {
	return node instanceof HTMLElement
}

function isLeafEmailDiv(node: Node): boolean {
	if(!isHtmlElement(node) || node.tagName !== "DIV") {
		return false
	}

	return !Array.from(node.children).some((child) => BLOCK_CHILD_TAGS.has(child.tagName))
}

function readInlineFontFamily(element: HTMLElement): string | null {
	if(element.style.fontFamily) {
		return element.style.fontFamily
	}

	return element.getAttribute("face")
}

function readInlineColor(element: HTMLElement): string | null {
	if(element.style.color) {
		return element.style.color
	}

	return element.getAttribute("color")
}

function readInlineBackgroundColor(element: HTMLElement): string | null {
	return element.style.backgroundColor || null
}

function readInlineTextTransform(element: HTMLElement): string | null {
	return element.style.textTransform || null
}

function applyMissingStyles(element: HTMLElement, styles: InheritedTextStyles): void {
	if(styles.fontFamily && !element.style.fontFamily) {
		element.style.fontFamily = styles.fontFamily
	}

	if(styles.color && !element.style.color) {
		element.style.color = styles.color
	}

	if(styles.backgroundColor && !element.style.backgroundColor) {
		element.style.backgroundColor = styles.backgroundColor
	}

	if(styles.textTransform && !element.style.textTransform) {
		element.style.textTransform = styles.textTransform
	}
}

function convertFontTags(documentNode: Document): void {
	const fontTags = Array.from(documentNode.querySelectorAll("font"))

	for(const fontTag of fontTags) {
		const span = documentNode.createElement("span")
		const styleParts: string[] = []
		const face = fontTag.getAttribute("face")
		const color = fontTag.getAttribute("color")
		const existingStyle = fontTag.getAttribute("style")

		if(face) {
			styleParts.push(`font-family: ${face}`)
		}

		if(color) {
			styleParts.push(`color: ${color}`)
		}

		if(existingStyle) {
			styleParts.push(existingStyle)
		}

		if(styleParts.length > 0) {
			span.setAttribute("style", styleParts.join("; "))
		}

		while(fontTag.firstChild) {
			span.appendChild(fontTag.firstChild)
		}

		fontTag.replaceWith(span)
	}
}

function applyAuthorFontAndColorRules(documentNode: Document): void {
	const styleSheets = Array.from(documentNode.styleSheets)

	for(const styleSheet of styleSheets) {
		let rules: CSSRuleList

		try {
			rules = styleSheet.cssRules
		} catch{
			continue
		}

		for(const rule of Array.from(rules)) {
			if(!(rule instanceof CSSStyleRule)) {
				continue
			}

			const fontFamily = rule.style.fontFamily
			const color = rule.style.color
			const backgroundColor = rule.style.backgroundColor

			if(!fontFamily && !color && !backgroundColor) {
				continue
			}

			let matches: NodeListOf<Element>

			try {
				matches = documentNode.querySelectorAll(rule.selectorText)
			} catch{
				continue
			}

			for(const match of Array.from(matches)) {
				if(!(match instanceof HTMLElement)) {
					continue
				}

				if(fontFamily && !match.style.fontFamily) {
					match.style.fontFamily = fontFamily
				}

				if(color && !match.style.color) {
					match.style.color = color
				}

				if(backgroundColor && !match.style.backgroundColor) {
					match.style.backgroundColor = backgroundColor
				}
			}
		}
	}
}

function wrapTextWithInheritedFontAndColor(root: HTMLElement): void {
	const walk = (node: Node, inherited: InheritedTextStyles): void => {
		if(node.nodeType === Node.TEXT_NODE) {
			const textNode = node as Text
			if(!textNode.textContent) {
				return
			}

			if(!inherited.fontFamily && !inherited.color && !inherited.backgroundColor && !inherited.textTransform) {
				return
			}

			const parent = textNode.parentElement
			if(!parent || SKIP_TAGS.has(parent.tagName)) {
				return
			}

			if(parent.tagName === "SPAN") {
				applyMissingStyles(parent, inherited)
				return
			}

			const span = parent.ownerDocument.createElement("span")
			applyMissingStyles(span, inherited)
			parent.insertBefore(span, textNode)
			span.appendChild(textNode)
			return
		}

		if(node.nodeType !== Node.ELEMENT_NODE) {
			return
		}

		const element = node as HTMLElement
		if(SKIP_TAGS.has(element.tagName)) {
			return
		}

		const nextInherited: InheritedTextStyles = {
			fontFamily: readInlineFontFamily(element) ?? inherited.fontFamily,
			color: readInlineColor(element) ?? inherited.color,
			backgroundColor: readInlineBackgroundColor(element) ?? inherited.backgroundColor,
			textTransform: readInlineTextTransform(element) ?? inherited.textTransform,
		}

		const children = Array.from(element.childNodes)
		for(const child of children) {
			walk(child, nextInherited)
		}
	}

	walk(root, {
		fontFamily: null,
		color: null,
		backgroundColor: null,
		textTransform: null,
	})
}

function copyMissingStyles(source: HTMLElement, target: HTMLElement, properties: ReadonlySet<string>): void {
	for(let index = 0; index < source.style.length; index++) {
		const property = source.style.item(index)
		if(!properties.has(property)) {
			continue
		}

		if(target.style.getPropertyValue(property)) {
			continue
		}

		const value = source.style.getPropertyValue(property)
		if(!value) {
			continue
		}

		target.style.setProperty(property, value)
	}
}

function unwrapElement(element: HTMLElement): void {
	const parent = element.parentNode
	if(!parent) {
		return
	}

	while(element.firstChild) {
		parent.insertBefore(element.firstChild, element)
	}

	parent.removeChild(element)
}

function flattenEmailWrapperDivs(root: HTMLElement): void {
	const wrappers = Array.from(root.querySelectorAll("div")).reverse()

	for(const wrapper of wrappers) {
		if(!(wrapper instanceof HTMLElement) || isLeafEmailDiv(wrapper)) {
			continue
		}

		const childElements = Array.from(wrapper.children).filter((child): child is HTMLElement => child instanceof HTMLElement)
		if(childElements.length === 0) {
			continue
		}

		for(const child of childElements) {
			copyMissingStyles(wrapper, child, INHERITED_STYLE_PROPERTIES)
		}

		copyMissingStyles(wrapper, childElements[0], BOX_STYLE_PROPERTIES)
		unwrapElement(wrapper)
	}
}

export function normalizePastedSignatureHtml(html: string): string {
	const parsed = new DOMParser().parseFromString(html, "text/html")
	convertFontTags(parsed)
	applyAuthorFontAndColorRules(parsed)
	flattenEmailWrapperDivs(parsed.body)
	wrapTextWithInheritedFontAndColor(parsed.body)
	return parsed.body.innerHTML
}
