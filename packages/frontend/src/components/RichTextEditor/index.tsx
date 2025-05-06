import { RichTextEditor as MantineRichTextEditor, Link } from "@mantine/tiptap"
import Highlight from "@tiptap/extension-highlight"
import SubScript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { ReactNode, useEffect } from "react"

interface RichTextEditorProps {
	value: string
	onChange: (value: string) => void
	content?: string
	className?: string
	children?: ReactNode
}

export function RichTextEditor({ value, onChange, content, className, children }: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Link,
			Superscript,
			SubScript,
			Highlight,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
		],
		content: content ?? value,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML())
		},
	})

	// Keep editor content in sync with value
	useEffect(() => {
		if(editor && value !== editor.getHTML()) {
			editor.commands.setContent(value, false)
		}
	}, [value, editor])

	return (
		<MantineRichTextEditor editor={ editor } className={ className }>
			{ children ?? <>
				<MantineRichTextEditor.Toolbar sticky stickyOffset={ 60 }>
					<MantineRichTextEditor.ControlsGroup>
						<MantineRichTextEditor.Bold />
						<MantineRichTextEditor.Italic />
						<MantineRichTextEditor.Underline />
						<MantineRichTextEditor.Strikethrough />
						<MantineRichTextEditor.ClearFormatting />
						<MantineRichTextEditor.Highlight />
						<MantineRichTextEditor.Code />
					</MantineRichTextEditor.ControlsGroup>
					<MantineRichTextEditor.ControlsGroup>
						<MantineRichTextEditor.H1 />
						<MantineRichTextEditor.H2 />
						<MantineRichTextEditor.H3 />
						<MantineRichTextEditor.H4 />
					</MantineRichTextEditor.ControlsGroup>
					<MantineRichTextEditor.ControlsGroup>
						<MantineRichTextEditor.BulletList />
						<MantineRichTextEditor.OrderedList />
						<MantineRichTextEditor.Hr />
						<MantineRichTextEditor.Blockquote />
						<MantineRichTextEditor.Undo />
						<MantineRichTextEditor.Redo />
					</MantineRichTextEditor.ControlsGroup>
					<MantineRichTextEditor.ControlsGroup>
						<MantineRichTextEditor.Link />
						<MantineRichTextEditor.Unlink />
					</MantineRichTextEditor.ControlsGroup>
				</MantineRichTextEditor.Toolbar>
				<MantineRichTextEditor.Content />
			</> }
		</MantineRichTextEditor>
	)
}
