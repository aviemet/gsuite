import { Extension, Editor, Range } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { BracketsNode } from "./BracketsNode"
import { BracketsSuggestion } from "./BracketsSuggestion"

interface TextWithPos {
	text: string
	pos: number
}

interface SuggestionProps {
	editor: Editor
	range: Range
	props: {
		title: string
	}
	clientRect: () => DOMRect | null
}

interface SuggestionQuery {
	query: string
}

export const BracketsExtension = Extension.create<{}>({
	name: "bracketsExtension",

	addProseMirrorPlugins() {
		const pluginKey = new PluginKey("bracketsExtension")

		return [
			new Plugin({
				key: pluginKey,
				view: () => {
					return {
						update: (view) => {
							const { state } = view
							const { doc, schema } = state
							const { brackets } = schema.nodes

							// Find all text nodes and collect text with positions
							const textNodes: TextWithPos[] = []
							doc.descendants((node, pos) => {
								if(node.isText) {
									textNodes.push({
										text: node.text as string,
										pos,
									})
								}
								return true
							})

							// Process all found text nodes
							let transaction = state.tr
							let modified = false

							// Important: Process nodes in reverse order to avoid position shifts
							for(let i = textNodes.length - 1; i >= 0; i--) {
								const { text, pos } = textNodes[i]
								const regex = /\{\{([^{}]+)\}\}/g
								let match

								// Reset regex
								regex.lastIndex = 0

								while((match = regex.exec(text)) !== null) {
									const from = pos + match.index
									const to = from + match[0].length

									// Check if this position is valid and not already a brackets node
									try {
										const nodeAtPos = state.doc.nodeAt(from)
										if(nodeAtPos && nodeAtPos.isText) {
											transaction = transaction.replaceWith(
												from,
												to,
												brackets.create({ content: match[1] })
											)
											modified = true
										}
									} catch(e) {
										console.warn("Position error when processing brackets:", e)
										// Skip this match if position is invalid
										continue
									}
								}
							}

							if(modified) {
								view.dispatch(transaction)
							}
						},
					}
				},
			}),
		]
	},

	addExtensions() {
		return [
			BracketsNode.configure({
				suggestion: {
					char: "{{",
					command: ({ editor, range, props }: SuggestionProps) => {
						editor
							.chain()
							.focus()
							.insertContentAt(range, [
								{
									type: "brackets",
									attrs: { content: props.title },
								},
							])
							.run()
					},
					allow: () => {
						return true
					},
					items: ({ query }: SuggestionQuery) => {
						return [
							{ title: "first_name", description: "User's first name" },
							{ title: "last_name", description: "User's last name" },
							{ title: "email", description: "User's email address" },
							{ title: "company", description: "User's company name" },
						].filter((item) => {
							return item.title.toLowerCase().startsWith(query.toLowerCase())
						})
					},
					render: () => {
						let component: ReturnType<typeof BracketsSuggestion.create>

						return {
							onStart: (props: SuggestionProps) => {
								component = BracketsSuggestion.create()
								component.onStart(props)
							},
							onUpdate: (props: SuggestionProps) => {
								component.onUpdate(props)
							},
							onKeyDown: (props: SuggestionProps) => {
								return component.onKeyDown(props)
							},
							onExit: () => {
								component.onExit()
							},
						}
					},
				},
			}),
		]
	},
})
