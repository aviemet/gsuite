import { Node } from "@tiptap/core"
import { ReactRenderer } from "@tiptap/react"
import { Node as ProseMirrorNode } from "@tiptap/pm/model"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import tippy from "tippy.js"
import { BracketsFallback } from "./BracketsFallback"

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		brackets: {
			insertBrackets: (content: string, fallback?: string) => ReturnType
		}
	}
}

interface BracketsAttributes {
	content: string
	fallback: string | null
}

export interface BracketsNodeOptions {}

export const BracketsNode = Node.create<BracketsNodeOptions>({
	name: "brackets",

	group: "inline",

	inline: true,

	selectable: true,

	atom: true,

	addAttributes() {
		return {
			content: {
				default: "",
			},
			fallback: {
				default: null,
			},
		}
	},

	parseHTML() {
		return [
			{
				tag: "span[data-brackets-content]",
				getAttrs: (node) => {
					if(typeof node === "string") return false
					const element = node as HTMLElement
					return {
						content: element.getAttribute("data-brackets-content"),
						fallback: element.getAttribute("data-brackets-fallback"),
					}
				},
			},
		]
	},

	renderHTML({ node }) {
		return [
			"span",
			{
				"data-brackets-content": node.attrs.content,
				"data-brackets-fallback": node.attrs.fallback,
				class: "brackets-node",
			},
			node.attrs.fallback ? `{{${node.attrs.content}|"${node.attrs.fallback}"}}` : `{{${node.attrs.content}}}`,
		]
	},

	renderText({ node }) {
		return node.attrs.fallback
			? `{{${node.attrs.content}|"${node.attrs.fallback}"}}`
			: `{{${node.attrs.content}}}`
	},

	addCommands() {
		return {
			insertBrackets: (content: string, fallback?: string) => ({ commands }) => {
				return commands.insertContent({
					type: this.name,
					attrs: { content, fallback },
				})
			},
		}
	},

	addProseMirrorPlugins() {
		const pluginKey = new PluginKey("bracketsFallback")

		return [
			new Plugin({
				key: pluginKey,
				props: {
					handleClickOn: (view, pos, node, nodePos, event, direct) => {
						if(node.type !== this.type) return false

						let popup: any = null
						const component = new ReactRenderer(BracketsFallback, {
							props: {
								editor: this.editor,
								node,
								updateAttributes: (attrs: Partial<BracketsAttributes>) => {
									const transaction = view.state.tr.setNodeMarkup(nodePos, undefined, {
										...node.attrs,
										...attrs,
									})
									view.dispatch(transaction)
									popup[0].destroy()
								},
							},
							editor: this.editor,
						})

						popup = tippy(event.target as HTMLElement, {
							content: component.element,
							showOnCreate: true,
							interactive: true,
							trigger: "manual",
							placement: "bottom",
							onDestroy: () => {
								component.destroy()
							},
						})

						return true
					},
				},
			}),
		]
	},
})
