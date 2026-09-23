import { Box } from "@mantine/core"
import { Editor as TinyMceReactEditor } from "@tinymce/tinymce-react"
import {
	ReactNode,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
	type Ref,
} from "react"
import { type Editor as TinyMCEEditor } from "tinymce"

import { getEditorPlugins, getEditorSizeOptions, syncEditorOverflowScroll } from "./editorSize"
import { normalizePastedSignatureHtml } from "./normalizePastedSignatureHtml"
import * as classes from "./RichTextEditor.css"
import { registerTextColorButton } from "./textColorButton"
import { TextColorPopover } from "./TextColorPopover"
import { unwrapLegacyTokenChips } from "./unwrapLegacyTokenChips"
import "./tinymceSetup"

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

const FONT_FAMILY_FORMATS = [
	"Arial=arial,helvetica,sans-serif",
	"Arial Black='arial black',gadget,sans-serif",
	"Comic Sans MS='comic sans ms',cursive,sans-serif",
	"Courier New='courier new',courier,monospace",
	"Georgia=georgia,serif",
	"Impact=impact,charcoal,sans-serif",
	"Lucida Sans Unicode='lucida sans unicode','lucida grande',sans-serif",
	"Palatino Linotype='palatino linotype','book antiqua',palatino,serif",
	"Tahoma=tahoma,geneva,sans-serif",
	"Times New Roman='times new roman',times,serif",
	"Trebuchet MS='trebuchet ms',helvetica,sans-serif",
	"Verdana=verdana,geneva,sans-serif",
].join("; ")

const CONTENT_STYLE = `
	body {
		background-color: #ffffff;
		color: #000000;
		color-scheme: light;
		font-family: Arial, Helvetica, sans-serif;
		font-size: 14px;
		line-height: 1.4;
		margin: 8px;
		min-height: 12rem;
	}
`

function readPersistedHtml(editor: TinyMCEEditor): string {
	return unwrapLegacyTokenChips(editor.getContent({ format: "html" }))
}

function registerTextTransformFormats(editor: TinyMCEEditor): void {
	editor.formatter.register("texttransform_uppercase", {
		inline: "span",
		styles: { "text-transform": "uppercase" },
	})
	editor.formatter.register("texttransform_lowercase", {
		inline: "span",
		styles: { "text-transform": "lowercase" },
	})
	editor.formatter.register("texttransform_capitalize", {
		inline: "span",
		styles: { "text-transform": "capitalize" },
	})
}

function registerTextTransformButtons(editor: TinyMCEEditor): void {
	const transforms = [
		{ name: "uppercase", text: "AA", tooltip: "Uppercase", format: "texttransform_uppercase" },
		{ name: "lowercase", text: "aa", tooltip: "Lowercase", format: "texttransform_lowercase" },
		{ name: "capitalize", text: "Aa", tooltip: "Capitalize", format: "texttransform_capitalize" },
	] as const

	for(const transform of transforms) {
		editor.ui.registry.addToggleButton(transform.name, {
			text: transform.text,
			tooltip: transform.tooltip,
			onAction: () => {
				editor.formatter.toggle(transform.format)
			},
			onSetup: (buttonApi) => {
				const sync = () => {
					buttonApi.setActive(editor.formatter.match(transform.format))
				}

				editor.on("NodeChange", sync)
				return () => {
					editor.off("NodeChange", sync)
				}
			},
		})
	}
}

export function RichTextEditor({
	value,
	onChange,
	content,
	className,
	children,
	ref,
}: RichTextEditorProps) {
	const [initialHtml] = useState(() => content ?? value)
	const editorRef = useRef<TinyMCEEditor | null>(null)
	const lastEmittedHtmlRef = useRef(initialHtml)
	const skipNextChangeRef = useRef(true)
	const bookmarkRef = useRef<ReturnType<TinyMCEEditor["selection"]["getBookmark"]> | null>(null)
	const onChangeRef = useRef(onChange)
	const [editorInstance, setEditorInstance] = useState<TinyMCEEditor | null>(null)
	const [colorPickerOpened, setColorPickerOpened] = useState(false)
	const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null)

	useEffect(() => {
		onChangeRef.current = onChange
	}, [onChange])

	const emitChange = useCallback((editor: TinyMCEEditor) => {
		if(skipNextChangeRef.current) {
			skipNextChangeRef.current = false
			lastEmittedHtmlRef.current = readPersistedHtml(editor)
			return
		}

		const html = readPersistedHtml(editor)
		if(html === lastEmittedHtmlRef.current) {
			return
		}

		lastEmittedHtmlRef.current = html
		onChangeRef.current(html)
	}, [])

	const rememberSelection = useCallback(() => {
		const editor = editorRef.current
		if(!editor || editor.destroyed) {
			return
		}

		bookmarkRef.current = editor.selection.getBookmark(2, true)
	}, [])

	const restoreSelection = useCallback(() => {
		const editor = editorRef.current
		if(!editor || editor.destroyed || !bookmarkRef.current) {
			return
		}

		editor.focus()
		editor.selection.moveToBookmark(bookmarkRef.current)
	}, [])

	const closeColorPicker = useCallback(() => {
		setColorPickerOpened(false)
		setColorPickerAnchor(null)
	}, [])

	const toggleColorPicker = useCallback((anchor: HTMLElement) => {
		rememberSelection()
		setColorPickerOpened((wasOpened) => {
			if(wasOpened) {
				setColorPickerAnchor(null)
				return false
			}

			setColorPickerAnchor(anchor)
			return true
		})
	}, [rememberSelection])

	const colorButtonOnToggleRef = useRef(toggleColorPicker)

	useEffect(() => {
		colorButtonOnToggleRef.current = toggleColorPicker
	}, [toggleColorPicker])

	useImperativeHandle(ref, () => ({
		insertAtCursor: (text: string) => {
			const editor = editorRef.current
			if(!editor) {
				return
			}

			restoreSelection()
			editor.insertContent(text)
			emitChange(editor)
		},
	}), [emitChange, restoreSelection])

	useEffect(() => {
		const editor = editorRef.current
		if(!editor || editor.destroyed) {
			return
		}

		if(value === lastEmittedHtmlRef.current) {
			return
		}

		skipNextChangeRef.current = true
		editor.setContent(value)
		lastEmittedHtmlRef.current = value
	}, [value])

	const initOptions = useMemo(() => ({
		menubar: false,
		branding: false,
		promotion: false,
		...getEditorSizeOptions(),
		plugins: getEditorPlugins(),
		toolbar: [
			"undo redo | blocks fontfamily | bold italic underline strikethrough",
			"uppercase lowercase capitalize | signatureforecolor backcolor removeformat | bullist numlist | blockquote hr | link",
		],
		font_family_formats: FONT_FAMILY_FORMATS,
		skin: "oxide",
		content_style: CONTENT_STYLE,
		forced_root_block: "div",
		convert_urls: false,
		relative_urls: false,
		remove_script_host: false,
		entity_encoding: "raw" as const,
		valid_elements: "*[*]",
		extended_valid_elements: "*[*]",
		paste_preprocess: (_plugin: unknown, args: { content: string }) => {
			args.content = normalizePastedSignatureHtml(args.content)
		},
		setup: (editor: TinyMCEEditor) => {
			registerTextTransformButtons(editor)
			registerTextColorButton(editor, {
				onToggle: (anchor) => {
					colorButtonOnToggleRef.current(anchor)
				},
			})
			const scheduleOverflowSync = () => {
				queueMicrotask(() => {
					syncEditorOverflowScroll(editor)
				})
			}
			editor.on("init", () => {
				registerTextTransformFormats(editor)
				scheduleOverflowSync()
			})
			editor.on("NodeChange SetContent keyup ResizeEditor ResizeContent", scheduleOverflowSync)
			editor.on("blur", () => {
				bookmarkRef.current = editor.selection.getBookmark(2, true)
			})
			editor.on("input change SetContent Undo Redo", () => {
				emitChange(editor)
			})
		},
	}), [emitChange])

	return (
		<Box className={ className } data-signature-rich-text-editor="">
			{ children ?? (
				<>
					<Box className={ classes.editor }>
						<TinyMceReactEditor
							licenseKey="gpl"
							initialValue={ initialHtml }
							init={ initOptions }
							onInit={ (_event, editor) => {
								editorRef.current = editor
								setEditorInstance(editor)
								lastEmittedHtmlRef.current = readPersistedHtml(editor)
								skipNextChangeRef.current = true
							} }
						/>
					</Box>
					<TextColorPopover
						editor={ editorInstance }
						opened={ colorPickerOpened }
						anchor={ colorPickerAnchor }
						onClose={ closeColorPicker }
						onApplied={ () => {
							if(editorInstance) {
								emitChange(editorInstance)
							}
						} }
						restoreSelection={ restoreSelection }
						rememberSelection={ rememberSelection }
					/>
				</>
			) }
		</Box>
	)
}
