import { html } from "@codemirror/lang-html"
import { okaidia } from "@uiw/codemirror-themes-all" // A popular dark theme, can be changed
import CodeMirror from "@uiw/react-codemirror"

interface HtmlEditorProps {
	value: string
	onChange: (value: string) => void
	// We can add other CodeMirror options as props if needed, e.g., height, theme
}

export function HtmlEditor({ value, onChange }: HtmlEditorProps) {
	return (
		<CodeMirror
			value={ value }
			height="300px" // Default height, can be customized via props
			extensions={ [html()] } // Enable HTML language support
			onChange={ (newValue) => {
				onChange(newValue)
			} }
			theme={ okaidia } // Using okaidia theme as a starting point
			// You can explore other themes or create a custom one that matches Mantine
			// For example, a light theme: import { sublime } from "@uiw/codemirror-theme-sublime";
		/>
	)
}
