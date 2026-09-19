import { mergeAttributes } from "@tiptap/core"
import Bold from "@tiptap/extension-bold"
import Italic from "@tiptap/extension-italic"
import Paragraph from "@tiptap/extension-paragraph"

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

function isHtmlElement(node: globalThis.Node | string): node is HTMLElement {
	return node instanceof HTMLElement
}

export function isLeafEmailDiv(node: globalThis.Node | string): boolean {
	if(!isHtmlElement(node) || node.tagName !== "DIV") {
		return false
	}

	return !Array.from(node.children).some((child) => BLOCK_CHILD_TAGS.has(child.tagName))
}

const MARK_STYLE_PROPERTIES = new Set([
	"font-family",
	"color",
	"background-color",
	"text-transform",
	"font-weight",
	"font-style",
	"text-align",
])

function readBlockStyle(element: HTMLElement): string | null {
	const parts: string[] = []

	for(let index = 0; index < element.style.length; index++) {
		const property = element.style.item(index)
		if(MARK_STYLE_PROPERTIES.has(property)) {
			continue
		}

		const value = element.style.getPropertyValue(property)
		if(!value) {
			continue
		}

		parts.push(`${ property }: ${ value }`)
	}

	if(parts.length === 0) {
		return null
	}

	return parts.join("; ")
}

export const EmailParagraph = Paragraph.extend({
	addAttributes() {
		return {
			...(this.parent?.() ?? {}),
			blockStyle: {
				default: null,
				parseHTML: (element: HTMLElement) => readBlockStyle(element),
				renderHTML: (attributes: { blockStyle?: string | null }) => {
					if(typeof attributes.blockStyle !== "string" || attributes.blockStyle.length === 0) {
						return {}
					}

					return { style: attributes.blockStyle }
				},
			},
		}
	},
	parseHTML() {
		return [
			{
				tag: "div",
				getAttrs: (node) => (isLeafEmailDiv(node) ? {} : false),
			},
			{
				tag: "p",
			},
		]
	},
	renderHTML({ HTMLAttributes }) {
		return ["div", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
	},
})

export const EmailBold = Bold.extend({
	renderHTML({ HTMLAttributes }) {
		return ["b", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
	},
})

export const EmailItalic = Italic.extend({
	renderHTML({ HTMLAttributes }) {
		return ["i", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
	},
})
