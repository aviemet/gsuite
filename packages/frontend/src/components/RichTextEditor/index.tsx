import { Select, Button } from "@mantine/core"
import { RichTextEditor as MantineRichTextEditor, Link } from "@mantine/tiptap"
import Blockquote from "@tiptap/extension-blockquote"
import Bold from "@tiptap/extension-bold"
import Code from "@tiptap/extension-code"
import { Color } from "@tiptap/extension-color"
import Document from "@tiptap/extension-document"
import FontFamily from "@tiptap/extension-font-family"
import HardBreak from "@tiptap/extension-hard-break"
import Heading from "@tiptap/extension-heading"
import Highlight from "@tiptap/extension-highlight"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Italic from "@tiptap/extension-italic"
import { BulletList, ListItem, ListKeymap, OrderedList } from "@tiptap/extension-list"
import Paragraph from "@tiptap/extension-paragraph"
import Strike from "@tiptap/extension-strike"
import SubScript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import Text from "@tiptap/extension-text"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import { UndoRedo } from "@tiptap/extensions"
import { useEditor } from "@tiptap/react"
import { ReactNode, useEffect, useState } from "react"
import { BracketsExtension } from "@/frontend/lib/tiptapBracketsExtension/BracketsExtension"
// import { DirectiveNode } from "./DirectiveNode"

interface LocalFontData {
	family: string
	// Add other properties like fullName, postscriptName, style if needed
}

interface RichTextEditorProps {
	value: string
	onChange: (value: string) => void
	content?: string
	className?: string
	children?: ReactNode
}

const INITIAL_FONT_FAMILY_OPTIONS = [
	{ value: "Arial", label: "Arial" },
	{ value: "'Arial Black', Gadget, sans-serif", label: "Arial Black" },
	{ value: "'Comic Sans MS', cursive, sans-serif", label: "Comic Sans MS" },
	{ value: "'Courier New', Courier, monospace", label: "Courier New" },
	{ value: "Georgia, serif", label: "Georgia" },
	{ value: "Impact, Charcoal, sans-serif", label: "Impact" },
	{ value: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif", label: "Lucida Sans Unicode" },
	{ value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif", label: "Palatino Linotype" },
	{ value: "Tahoma, Geneva, sans-serif", label: "Tahoma" },
	{ value: "'Times New Roman', Times, serif", label: "Times New Roman" },
	{ value: "'Trebuchet MS', Helvetica, sans-serif", label: "Trebuchet MS" },
	{ value: "Verdana, Geneva, sans-serif", label: "Verdana" },
	// Add custom fonts here once configured, e.g.
	// { value: "'My Custom Font', Arial, sans-serif", label: "My Custom Font" }
]

const TEXT_COLORS = [
	"#25262b",
	"#868e96",
	"#fa5252",
	"#e64980",
	"#be4bdb",
	"#7950f2",
	"#4c6ef5",
	"#228be6",
	"#15aabf",
	"#12b886",
	"#40c057",
	"#82c91e",
	"#fab005",
	"#fd7e14",
]

export function RichTextEditor({ value, onChange, content, className, children }: RichTextEditorProps) {
	const [fontFamilyOptions, setFontFamilyOptions] = useState(INITIAL_FONT_FAMILY_OPTIONS)

	const editor = useEditor({
		immediatelyRender: false,
		shouldRerenderOnTransaction: true,
		extensions: [
			Document,
			Paragraph,
			Text,
			HardBreak,
			Bold,
			Italic,
			Underline,
			Strike,
			Code,
			Heading,
			Blockquote,
			HorizontalRule,
			BulletList,
			OrderedList,
			ListItem,
			ListKeymap,
			UndoRedo,
			Link,
			Superscript,
			SubScript,
			Highlight,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			TextStyle,
			FontFamily.configure({ types: ["textStyle"] }),
			Color.configure({ types: ["textStyle"] }),
			// DirectiveNode,
			BracketsExtension,
		],
		content: content ?? value,
		onUpdate: ({ editor: updatedEditor }) => {
			// Important: Get HTML for the final output. We will need to discuss how DirectiveNode serializes.
			onChange(updatedEditor.getHTML())
		},
	})

	// Keep editor content in sync with value
	useEffect(() => {
		if(editor && value !== editor.getHTML()) {
			editor.commands.setContent(value, { emitUpdate: false })
		}
	}, [value, editor])

	const handleLoadSystemFonts = async() => {
		if(!("queryLocalFonts" in window)) {
			console.warn("Local Font Access API not supported.")
			return
		}

		try {
			// @ts-expect-error queryLocalFonts is not yet in standard TS DOM lib, but we assert the type of its items
			const availableFonts: LocalFontData[] = await window.queryLocalFonts()
			const uniqueFontFamilies = Array.from(
				new Set(availableFonts.map((font) => font.family))
			).sort()

			const systemFontOptions: Array<{ value: string, label: string }> = uniqueFontFamilies.map(family => ({
				value: family,
				label: family,
			}))

			const existingLabels = new Set(INITIAL_FONT_FAMILY_OPTIONS.map(opt => opt.label))
			const newSystemOptions = systemFontOptions.filter(opt => !existingLabels.has(opt.label))

			setFontFamilyOptions(prevOptions =>
				[...prevOptions, ...newSystemOptions].sort((a, b) => a.label.localeCompare(b.label))
			)
		} catch(err) {
			console.error("Error accessing local fonts:", err)
			// Optionally, inform the user
		}
	}

	const selectedFontFamily = editor
		? fontFamilyOptions.find((opt: { value: string, label: string }) =>
			editor.isActive("textStyle", { fontFamily: opt.value })
		)?.value ?? ""
		: ""

	const handleFontFamilyChange = (selectedValue: string | null) => {
		if(!editor) return
		if(selectedValue) {
			editor.chain().focus().setFontFamily(selectedValue).run()
			return
		}

		editor.chain().focus().unsetFontFamily().run()
	}

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
						<Select
							placeholder="Font"
							value={ selectedFontFamily }
							onChange={ handleFontFamilyChange }
							data={ [{ value: "", label: "Default" }, ...fontFamilyOptions] }
							size="xs"
						/>
						<Button onClick={ handleLoadSystemFonts } size="xs" variant="default">Load System Fonts</Button>
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
					<MantineRichTextEditor.ControlsGroup>
						<MantineRichTextEditor.ColorPicker colors={ TEXT_COLORS } />
						<MantineRichTextEditor.UnsetColor />
					</MantineRichTextEditor.ControlsGroup>
				</MantineRichTextEditor.Toolbar>
				<MantineRichTextEditor.Content />
			</> }
		</MantineRichTextEditor>
	)
}
