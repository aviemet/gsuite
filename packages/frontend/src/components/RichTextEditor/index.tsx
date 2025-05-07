import { Select, Button, Popover, ColorPicker } from "@mantine/core"
import { RichTextEditor as MantineRichTextEditor, Link } from "@mantine/tiptap"
import { Color } from "@tiptap/extension-color"
import FontFamily from "@tiptap/extension-font-family"
import Highlight from "@tiptap/extension-highlight"
import SubScript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import TextAlign from "@tiptap/extension-text-align"
import TextStyle from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { ReactNode, useEffect, useState } from "react"
import { DirectiveNode } from "./DirectiveNode"

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

export function RichTextEditor({ value, onChange, content, className, children }: RichTextEditorProps) {
	const [fontFamilyOptions, setFontFamilyOptions] = useState(INITIAL_FONT_FAMILY_OPTIONS)

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				// If DirectiveNode is a block, ensure paragraph isn't too aggressive.
				// Or ensure your schema allows DirectiveNode at top level if StarterKit's paragraph does.
				// For now, default StarterKit is fine, DirectiveNode will try to convert <p> tags.
			}),
			Underline,
			Link,
			Superscript,
			SubScript,
			Highlight,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			TextStyle,
			FontFamily.configure({ types: ["textStyle"] }),
			Color.configure({ types: ["textStyle"] }),
			DirectiveNode,
		],
		content: content ?? value,
		onUpdate: ({ editor }) => {
			// Important: Get HTML for the final output. We will need to discuss how DirectiveNode serializes.
			onChange(editor.getHTML())
		},
	})

	// Keep editor content in sync with value
	useEffect(() => {
		if(editor && value !== editor.getHTML()) {
			editor.commands.setContent(value, false)
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
						{ editor && (
							<Select
								placeholder="Font"
								value={ fontFamilyOptions.find((opt: { value: string, label: string }) => editor.isActive("textStyle", { fontFamily: opt.value }))?.value || "" }
								onChange={ (selectedValue: string | null) => {
									if(!editor) return
									if(selectedValue) {
										editor.chain().focus().setFontFamily(selectedValue).run()
									} else {
										editor.chain().focus().unsetFontFamily().run()
									}
								} }
								data={ [{ value: "", label: "Default" }, ...fontFamilyOptions] }
								size="xs"
							/>
						) }
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
						<Popover width={ 200 } position="bottom" withArrow shadow="md">
							<Popover.Target>
								<Button
									variant="default"
									size="xs"
									aria-label="Pick color"
									style={ {
										color: editor?.getAttributes("textStyle").color,
									} }
								>
									Color
								</Button>
							</Popover.Target>
							<Popover.Dropdown>
								<ColorPicker
									format="hex"
									value={ editor?.getAttributes("textStyle").color || "#000000" }
									onChange={ (newColor) => editor?.chain().focus().setColor(newColor).run() }
								/>
								<Button
									fullWidth
									variant="default"
									size="xs"
									mt="xs"
									onClick={ () => editor?.chain().focus().unsetColor().run() }
								>
									Clear Color
								</Button>
							</Popover.Dropdown>
						</Popover>
					</MantineRichTextEditor.ControlsGroup>
				</MantineRichTextEditor.Toolbar>
				<MantineRichTextEditor.Content />
			</> }
		</MantineRichTextEditor>
	)
}
