import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "prosemirror-state"
import { BracketsNode } from "./BracketsNode"

interface TextWithPos {
	text: string
	pos: number
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
		return [BracketsNode]
	},
})
