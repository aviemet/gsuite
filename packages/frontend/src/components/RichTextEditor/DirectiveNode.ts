import { Node as TipTapNode, mergeAttributes } from "@tiptap/core"

// Regex to identify the Mustache-like block directives
// Matches {{#if condition}}, {{/if}}, {{else}}, {{#each items}}, {{/each}}, {{#unless condition}}, {{/unless}}, {{#with context}}, {{/with}}
const DIRECTIVE_REGEX = /^\{\{(?:[#/](?:if|each|with|unless)|else)[^}]*\}\}$/

// No module augmentation needed if we remove the custom command for now
// declare module "@tiptap/core" {
// 	interface Commands<ReturnType> {
// 		insertMustacheDirective: (text: string) => ReturnType
// 	}
// }

export interface DirectiveNodeOptions {}

export const DirectiveNode = TipTapNode.create<DirectiveNodeOptions>({
	name: "mustacheDirective",
	group: "block", // Crucial: This makes it a block-level node
	atom: true, // Its content is a single, indivisible unit, not directly editable
	draggable: true, // Allows dragging the block in the editor
	// We don't want this node to be directly editable or have its content treated as normal prosemirror text content
	content: "", // No ProseMirror content inside this node itself
	isolating: true, // Ensures content inside (if any, though we set to '') is isolated for commands

	addAttributes() {
		return {
			directiveText: {
				default: "",
			},
		}
	},

	parseHTML() {
		return [
			{
				// This is a very broad rule. It will look at EVERY element.
				tag: "*",
				priority: 250, // Very high priority to try and catch directives before other rules
				getAttrs: element => {
					if(!(element instanceof HTMLElement)) return false

					const trimmedText = element.textContent?.trim()
					if(trimmedText && DIRECTIVE_REGEX.test(trimmedText)) {
						// Key Condition: The element's direct innerHTML (trimmed) must be *identical*
						// to its trimmed textContent. This means the element contains ONLY the directive text
						// and no other nested HTML structure (like <span>, <b>, etc., but <br> might be an issue).
						// We also need to ensure it's not a pre-existing directive block from a previous renderHTML.
						if(element.dataset.type === "mustacheDirective") {
							// This element was already created by our renderHTML. Avoid re-processing.
							// If it has directiveText, it implies it IS our node. But we want to parse from *source* HTML.
							// This check might need refinement if we pass editor.getHTML() back in.
							return false
						}

						// A more robust check for "contains only text and maybe BRs that resolve to this text"
						// This is hard to do perfectly without a full DOM diff or more complex checks.
						// Let's try a simpler check first: the element's innerHTML is just the text.
						// We also have to consider that Tiptap might have added a <br> if it was an empty <p> it made.
						let simplifiedInnerHTML = element.innerHTML.trim()
						if(simplifiedInnerHTML.endsWith("<br>")) {
							simplifiedInnerHTML = simplifiedInnerHTML.slice(0, - 4).trim()
						}

						if(simplifiedInnerHTML === trimmedText) {
							return { directiveText: trimmedText }
						}
					}
					return false
				},
			},
		]
	},

	renderHTML({ HTMLAttributes, node }) {
		const directiveText = node.attrs.directiveText as string
		return [
			"span",
			mergeAttributes(HTMLAttributes, {
				"data-type": this.name,
				class: "mustache-directive-block ProseMirror-selectednode", // Apply selection style
				style:
					"padding: 0.25rem; " +
					"border: 1px solid #dee2e6; " +
					"background-color: #f1f3f5; " +
					"border-radius: 0.25rem; " +
					"margin: 0.5em 0; " +
					"white-space: pre-wrap; " +
					"font-family: monospace; " +
					"font-size: 0.9em; " +
					"box-shadow: 0 1px 2px rgba(0,0,0,0.07); ",
			}),
			directiveText,
		]
	},

	// Removing addCommands for now to resolve persistent type issues
	// addCommands() {
	// 	return { ... };
	// },
})
