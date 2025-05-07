import { html } from "@codemirror/lang-html"
import { EditorView } from "@codemirror/view"
import { okaidia, basicLight } from "@uiw/codemirror-themes-all" // A popular dark theme, can be changed
import CodeMirror from "@uiw/react-codemirror"
import { handlebarsLanguage } from "@xiechao/codemirror-lang-handlebars"

interface HtmlEditorProps {
	value: string
	onChange: (value: string) => void
	// We can add other CodeMirror options as props if needed, e.g., height, theme
}

const editorFontSize = EditorView.theme({
	"&": {
		fontSize: "0.9em",
	},
})

export function HtmlEditor({ value, onChange }: HtmlEditorProps) {
	return (
		<CodeMirror
			value={ value }
			extensions={ [html(), handlebarsLanguage, editorFontSize] } // Enable HTML language support and add handlebarsLanguage directly
			onChange={ (newValue) => {
				onChange(newValue)
			} }
			theme={ basicLight }
		/>
	)
}
