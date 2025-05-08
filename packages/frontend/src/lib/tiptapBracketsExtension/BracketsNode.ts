import { Node } from "@tiptap/core"
import { Node as ProseMirrorNode } from "prosemirror-model"

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		brackets: {
			insertBrackets: (content: string) => ReturnType
		}
	}
}

export interface BracketsNodeOptions {}

export const BracketsNode = Node.create<BracketsNodeOptions>({
	name: "brackets",

	group: "inline",

	inline: true,

	selectable: false,

	atom: true,

	addAttributes() {
		return {
			content: {
				default: "",
			},
		}
	},
	parseHTML() {
		return [
			// This is only for parsing back from HTML
			{
				tag: "span[data-brackets-content]",
				getAttrs: (node) => {
					if(typeof node === "string") return false
					const element = node as HTMLElement
					return {
						content: element.getAttribute("data-brackets-content"),
					}
				},
			},
		]
	},

	// We're not using renderHTML - instead we'll override toDOM
	renderHTML() {
		// This won't actually be used but is required
		return ["span", { "data-brackets-content": "" }, ""]
	},

	// Custom DOM serialization
	toDOM(node: ProseMirrorNode) {
		// Create a text node instead of an element
		return document.createTextNode(`{{${node.attrs.content}}}`)
	},

	renderText({ node }) {
		return `{{${node.attrs.content}}}`
	},

	addCommands() {
		return {
			insertBrackets: (content: string) => ({ commands }) => {
				return commands.insertContent({
					type: this.name,
					attrs: { content },
				})
			},
		}
	},
})
