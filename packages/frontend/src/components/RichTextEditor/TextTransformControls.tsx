import { Tooltip } from "@mantine/core"
import { RichTextEditor, useRichTextEditorContext } from "@mantine/tiptap"
import { IconLetterCaseLower, IconLetterCaseToggle, IconLetterCaseUpper } from "@tabler/icons-react"

import { isTextTransformValue, type TextTransformValue } from "./TextTransform"

interface TextTransformOption {
	value: TextTransformValue
	label: string
	Icon: typeof IconLetterCaseUpper
}

const textTransformOptions: TextTransformOption[] = [
	{ value: "uppercase", label: "Uppercase", Icon: IconLetterCaseUpper },
	{ value: "lowercase", label: "Lowercase", Icon: IconLetterCaseLower },
	{ value: "capitalize", label: "Capitalize", Icon: IconLetterCaseToggle },
]

export function TextTransformControls() {
	const { editor } = useRichTextEditorContext()

	if(!editor) {
		return null
	}

	const activeTransform = editor.getAttributes("textStyle").textTransform
	const activeValue = typeof activeTransform === "string" && isTextTransformValue(activeTransform)
		? activeTransform
		: null

	return (
		<>
			{ textTransformOptions.map(({ value, label, Icon }) => {
				const isActive = activeValue === value
				return (
					<Tooltip key={ value } label={ label } withArrow openDelay={ 250 }>
						<RichTextEditor.Control
							onClick={ () => {
								if(isActive) {
									editor.chain().focus().unsetTextTransform().run()
									return
								}

								editor.chain().focus().setTextTransform(value).run()
							} }
							aria-label={ label }
							title=""
							active={ isActive }
						>
							<Icon size={ 16 } />
						</RichTextEditor.Control>
					</Tooltip>
				)
			}) }
		</>
	)
}
