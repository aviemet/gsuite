import { Extension } from "@tiptap/core"

export const TEXT_TRANSFORM_VALUES = ["uppercase", "lowercase", "capitalize"] as const
export type TextTransformValue = typeof TEXT_TRANSFORM_VALUES[number]

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		textTransform: {
			setTextTransform: (textTransform: TextTransformValue) => ReturnType
			unsetTextTransform: () => ReturnType
		}
	}
}

declare module "@tiptap/extension-text-style" {
	interface TextStyleAttributes {
		textTransform?: string | null
	}
}

export function isTextTransformValue(value: string): value is TextTransformValue {
	return TEXT_TRANSFORM_VALUES.some((item) => item === value)
}

export const TextTransform = Extension.create({
	name: "textTransform",

	addOptions() {
		return {
			types: ["textStyle"],
		}
	},

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					textTransform: {
						default: null,
						parseHTML: (element: HTMLElement) => {
							const value = element.style.textTransform
							if(!isTextTransformValue(value)) {
								return null
							}

							return value
						},
						renderHTML: (attributes: { textTransform?: string | null }) => {
							if(!attributes.textTransform) {
								return {}
							}

							return { style: `text-transform: ${ attributes.textTransform }` }
						},
					},
				},
			},
		]
	},

	addCommands() {
		return {
			setTextTransform: (textTransform) => ({ chain }) => {
				return chain().setMark("textStyle", { textTransform }).run()
			},
			unsetTextTransform: () => ({ chain }) => {
				return chain().setMark("textStyle", { textTransform: null }).removeEmptyTextStyle().run()
			},
		}
	},
})
