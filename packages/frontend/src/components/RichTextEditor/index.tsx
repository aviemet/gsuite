import { Select, Tooltip } from "@mantine/core"
import { RichTextEditor as MantineRichTextEditor, Link } from "@mantine/tiptap"
import { Editor } from "@tiptap/core"
import Blockquote from "@tiptap/extension-blockquote"
import Code from "@tiptap/extension-code"
import { Color } from "@tiptap/extension-color"
import Document from "@tiptap/extension-document"
import FontFamily from "@tiptap/extension-font-family"
import HardBreak from "@tiptap/extension-hard-break"
import Heading from "@tiptap/extension-heading"
import Highlight from "@tiptap/extension-highlight"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import { BulletList, ListItem, ListKeymap, OrderedList } from "@tiptap/extension-list"
import Strike from "@tiptap/extension-strike"
import SubScript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import Text from "@tiptap/extension-text"
import TextAlign from "@tiptap/extension-text-align"
import { BackgroundColor, TextStyle } from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import { UndoRedo } from "@tiptap/extensions"
import { useEditor } from "@tiptap/react"
import { ReactElement, ReactNode, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react"

import { BracketsExtension } from "@/frontend/lib/tiptapBracketsExtension/BracketsExtension"

import { EmailBold, EmailItalic, EmailParagraph } from "./EmailParagraph"
import { normalizePastedSignatureHtml } from "./normalizePastedSignatureHtml"
import * as classes from "./RichTextEditor.css"
import { serializeEmailSignatureHtml } from "./serializeEmailSignatureHtml"
import { TextColorControl } from "./TextColorControl"
import { TextTransform } from "./TextTransform"
import { TextTransformControls } from "./TextTransformControls"

interface FontFamilyOption {
	value: string
	label: string
}

export interface RichTextEditorHandle {
	insertAtCursor: (text: string) => void
}

interface RichTextEditorProps {
	value: string
	onChange: (value: string) => void
	content?: string
	className?: string
	children?: ReactNode
	ref?: Ref<RichTextEditorHandle>
}

const INITIAL_FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
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
]

interface ToolbarTooltipProps {
	label: string
	children: ReactElement
}

function ToolbarTooltip({ label, children }: ToolbarTooltipProps) {
	return (
		<Tooltip label={ label } withArrow openDelay={ 250 }>
			{ children }
		</Tooltip>
	)
}

function fontFamilyLabel(fontFamily: string): string {
	return fontFamily.split(",")[0]?.trim().replace(/^['"]+|['"]+$/g, "") || fontFamily
}

function mergeFontFamilyOptions(base: FontFamilyOption[], extra: FontFamilyOption[]): FontFamilyOption[] {
	const optionsByValue = new Map<string, FontFamilyOption>()

	for(const option of base) {
		optionsByValue.set(option.value, option)
	}

	for(const option of extra) {
		if(!optionsByValue.has(option.value)) {
			optionsByValue.set(option.value, option)
		}
	}

	return Array.from(optionsByValue.values())
}

function collectDocumentFontFamilies(editor: Editor): FontFamilyOption[] {
	const fontFamilies = new Set<string>()

	editor.state.doc.descendants((node) => {
		for(const mark of node.marks) {
			const fontFamily = mark.attrs.fontFamily
			if(typeof fontFamily === "string" && fontFamily.length > 0) {
				fontFamilies.add(fontFamily)
			}
		}
	})

	return Array.from(fontFamilies).map((fontFamily) => ({
		value: fontFamily,
		label: fontFamilyLabel(fontFamily),
	}))
}

const SIMPLE_PLACEHOLDER = /^\{\{(\w+)\}\}$/

const EDITOR_PROPS = {
	transformPastedHTML: (html: string) => normalizePastedSignatureHtml(html),
}

const EDITOR_EXTENSIONS = [
	Document,
	EmailParagraph,
	Text,
	HardBreak,
	EmailBold,
	EmailItalic,
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
	Link,
	Superscript,
	SubScript,
	Highlight,
	TextAlign.configure({ types: ["heading", "paragraph"] }),
	TextStyle,
	FontFamily.configure({ types: ["textStyle"] }),
	Color.configure({ types: ["textStyle"] }),
	BackgroundColor.configure({ types: ["textStyle"] }),
	TextTransform,
	BracketsExtension,
	UndoRedo,
]

function isEditorUndoRedoTarget(target: EventTarget | null, proseMirror: HTMLElement): boolean {
	if(!(target instanceof HTMLElement)) {
		return false
	}

	return proseMirror.contains(target)
		|| target.closest("[data-signature-rich-text-editor]") !== null
		|| target.closest("[data-text-color-popover]") !== null
}

export function RichTextEditor({ value, onChange, content, className, children, ref }: RichTextEditorProps) {
	const [fontFamilyOptions, setFontFamilyOptions] = useState(INITIAL_FONT_FAMILY_OPTIONS)
	const lastSelectionRef = useRef({ from: 1, to: 1 })
	const isSyncingContentRef = useRef(false)
	const lastEmittedHtmlRef = useRef<string | null>(null)
	const initialContentRef = useRef(normalizePastedSignatureHtml(content ?? value))

	const syncFontFamilyOptions = (currentEditor: Editor) => {
		setFontFamilyOptions(mergeFontFamilyOptions(
			INITIAL_FONT_FAMILY_OPTIONS,
			collectDocumentFontFamilies(currentEditor),
		))
	}

	const editor = useEditor({
		immediatelyRender: false,
		shouldRerenderOnTransaction: true,
		extensions: EDITOR_EXTENSIONS,
		content: initialContentRef.current,
		editorProps: EDITOR_PROPS,
		onCreate: ({ editor: createdEditor }) => {
			lastEmittedHtmlRef.current = value
			syncFontFamilyOptions(createdEditor)
		},
		onUpdate: ({ editor: updatedEditor, transaction }) => {
			if(isSyncingContentRef.current || transaction.getMeta("bracketsAutoConvert") === true) {
				return
			}

			const html = serializeEmailSignatureHtml(updatedEditor)
			lastEmittedHtmlRef.current = html
			onChange(html)
			syncFontFamilyOptions(updatedEditor)
		},
	})

	useEffect(() => {
		if(!editor) {
			return
		}

		function rememberSelection({ editor: currentEditor }: { editor: Editor }) {
			if(isSyncingContentRef.current) {
				return
			}

			lastSelectionRef.current = {
				from: currentEditor.state.selection.from,
				to: currentEditor.state.selection.to,
			}
		}

		rememberSelection({ editor })
		editor.on("selectionUpdate", rememberSelection)
		editor.on("blur", rememberSelection)

		return () => {
			editor.off("selectionUpdate", rememberSelection)
			editor.off("blur", rememberSelection)
		}
	}, [editor])

	useEffect(() => {
		if(!editor) {
			return
		}

		function handleGlobalUndoRedo(event: KeyboardEvent) {
			if(event.defaultPrevented || event.altKey) {
				return
			}

			if(!event.metaKey && !event.ctrlKey) {
				return
			}

			const key = event.key.toLowerCase()
			const isUndo = key === "z" && !event.shiftKey
			const isRedo = key === "y" || (key === "z" && event.shiftKey)
			if(!isUndo && !isRedo) {
				return
			}

			if(!isEditorUndoRedoTarget(event.target, editor.view.dom)) {
				return
			}

			event.preventDefault()
			event.stopPropagation()
			if(isRedo) {
				editor.commands.redo()
				return
			}

			editor.commands.undo()
		}

		window.addEventListener("keydown", handleGlobalUndoRedo, true)
		return () => {
			window.removeEventListener("keydown", handleGlobalUndoRedo, true)
		}
	}, [editor])

	useEffect(() => {
		if(!editor || value === lastEmittedHtmlRef.current) {
			return
		}

		if(value === serializeEmailSignatureHtml(editor)) {
			lastEmittedHtmlRef.current = value
			return
		}

		isSyncingContentRef.current = true
		editor.chain().setMeta("addToHistory", false).setContent(normalizePastedSignatureHtml(value), { emitUpdate: false }).run()
		syncFontFamilyOptions(editor)
		const documentSize = editor.state.doc.content.size
		const from = Math.min(lastSelectionRef.current.from, documentSize)
		const to = Math.min(lastSelectionRef.current.to, documentSize)
		editor.chain().setMeta("addToHistory", false).setTextSelection({ from, to }).run()
		lastEmittedHtmlRef.current = value
		isSyncingContentRef.current = false
	}, [value, editor])

	useImperativeHandle(ref, () => ({
		insertAtCursor: (text: string) => {
			if(!editor) {
				return
			}

			const documentSize = editor.state.doc.content.size
			const from = Math.min(Math.max(lastSelectionRef.current.from, 1), documentSize)
			const to = Math.min(Math.max(lastSelectionRef.current.to, 1), documentSize)
			const chain = editor.chain().focus().setTextSelection({ from, to })
			const simpleToken = SIMPLE_PLACEHOLDER.exec(text)
			const token = simpleToken?.[1]
			if(token) {
				chain.insertBrackets(token).run()
			} else {
				chain.insertContent(text).run()
			}

			const insertEnd = editor.state.selection.to
			editor.commands.setTextSelection(insertEnd)
			lastSelectionRef.current = {
				from: insertEnd,
				to: insertEnd,
			}
		},
	}), [editor])

	const activeFontFamily = editor?.getAttributes("textStyle").fontFamily
	const selectedFontFamily = typeof activeFontFamily === "string" ? activeFontFamily : ""
	const fontSelectOptions = mergeFontFamilyOptions(
		fontFamilyOptions,
		selectedFontFamily
			? [{ value: selectedFontFamily, label: fontFamilyLabel(selectedFontFamily) }]
			: [],
	)

	const handleFontFamilyChange = (selectedValue: string | null) => {
		if(!editor) return
		if(selectedValue) {
			editor.chain().focus().setFontFamily(selectedValue).run()
			return
		}

		editor.chain().focus().unsetFontFamily().run()
	}

	return (
		<MantineRichTextEditor
			editor={ editor }
			className={ className }
			classNames={ { content: classes.content } }
			data-signature-rich-text-editor=""
		>
			{ children ?? <>
				<MantineRichTextEditor.Toolbar sticky stickyOffset={ 60 }>
					<MantineRichTextEditor.ControlsGroup>
						<ToolbarTooltip label="Bold">
							<MantineRichTextEditor.Bold title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Italic">
							<MantineRichTextEditor.Italic title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Underline">
							<MantineRichTextEditor.Underline title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Strikethrough">
							<MantineRichTextEditor.Strikethrough title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Clear formatting">
							<MantineRichTextEditor.ClearFormatting title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Highlight text">
							<MantineRichTextEditor.Highlight title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Code">
							<MantineRichTextEditor.Code title="" />
						</ToolbarTooltip>
					</MantineRichTextEditor.ControlsGroup>
					<MantineRichTextEditor.ControlsGroup>
						<ToolbarTooltip label="Heading 1">
							<MantineRichTextEditor.H1 title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Heading 2">
							<MantineRichTextEditor.H2 title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Heading 3">
							<MantineRichTextEditor.H3 title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Heading 4">
							<MantineRichTextEditor.H4 title="" />
						</ToolbarTooltip>
					</MantineRichTextEditor.ControlsGroup>
					<MantineRichTextEditor.ControlsGroup>
						<ToolbarTooltip label="Font family">
							<Select
								placeholder="Font"
								value={ selectedFontFamily }
								onChange={ handleFontFamilyChange }
								data={ [{ value: "", label: "Default" }, ...fontSelectOptions] }
								size="xs"
								searchable
								aria-label="Font family"
							/>
						</ToolbarTooltip>
					</MantineRichTextEditor.ControlsGroup>
					<MantineRichTextEditor.ControlsGroup>
						<TextTransformControls />
					</MantineRichTextEditor.ControlsGroup>
					<MantineRichTextEditor.ControlsGroup>
						<ToolbarTooltip label="Bullet list">
							<MantineRichTextEditor.BulletList title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Ordered list">
							<MantineRichTextEditor.OrderedList title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Horizontal line">
							<MantineRichTextEditor.Hr title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Blockquote">
							<MantineRichTextEditor.Blockquote title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Undo">
							<MantineRichTextEditor.Undo title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Redo">
							<MantineRichTextEditor.Redo title="" />
						</ToolbarTooltip>
					</MantineRichTextEditor.ControlsGroup>
					<MantineRichTextEditor.ControlsGroup>
						<ToolbarTooltip label="Link">
							<MantineRichTextEditor.Link title="" />
						</ToolbarTooltip>
						<ToolbarTooltip label="Remove link">
							<MantineRichTextEditor.Unlink title="" />
						</ToolbarTooltip>
					</MantineRichTextEditor.ControlsGroup>
					<MantineRichTextEditor.ControlsGroup>
						<TextColorControl />
						<ToolbarTooltip label="Unset color">
							<MantineRichTextEditor.UnsetColor title="" />
						</ToolbarTooltip>
					</MantineRichTextEditor.ControlsGroup>
				</MantineRichTextEditor.Toolbar>
				<MantineRichTextEditor.Content />
			</> }
		</MantineRichTextEditor>
	)
}
