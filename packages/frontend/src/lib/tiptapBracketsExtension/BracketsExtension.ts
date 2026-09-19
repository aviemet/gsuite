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

							let transaction = state.tr
							let modified = false

							for(let textNodeIndex = textNodes.length - 1; textNodeIndex >= 0; textNodeIndex--) {
								const { text, pos } = textNodes[textNodeIndex]
								const regex = /\{\{(\w+)(?:\|"([^"]*)")?\}\}/g
								const matches: RegExpExecArray[] = []
								let match = regex.exec(text)
								while(match !== null) {
									matches.push(match)
									match = regex.exec(text)
								}

								for(let matchIndex = matches.length - 1; matchIndex >= 0; matchIndex--) {
									const tokenMatch = matches[matchIndex]
									const from = pos + tokenMatch.index
									const to = from + tokenMatch[0].length
									const token = tokenMatch[1]
									const fallback = tokenMatch[2] ?? null

									try {
										const nodeAtPos = state.doc.nodeAt(from)
										if(nodeAtPos && nodeAtPos.isText) {
											transaction = transaction.replaceWith(
												from,
												to,
												brackets.create({ content: token, fallback }, null, nodeAtPos.marks),
											)
											modified = true
										}
									} catch (e) {
										// eslint-disable-next-line no-console
										console.warn("Position error when processing brackets:", e)
										continue
									}
								}
							}

							if(modified) {
								view.dispatch(
									transaction
										.setMeta("addToHistory", false)
										.setMeta("bracketsAutoConvert", true),
								)
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
