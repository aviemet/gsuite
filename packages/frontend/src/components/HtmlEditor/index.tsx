import { Box } from "@mantine/core"
import Prism from "prismjs"
import "prismjs/components/prism-markup"
import { useEffect, useImperativeHandle, useRef, type Ref } from "react"

import { editorRoot } from "./HtmlEditor.css"


interface HtmlEditorProps {
	value: string
	onChange: (value: string) => void
	ref?: Ref<HtmlEditorHandle>
}

export interface HtmlEditorHandle {
	insertAtCursor: (text: string) => void
}

function highlightHtml(code: string): string {
	const grammar = Prism.languages.markup
	if(!grammar) {
		return code
	}

	return Prism.highlight(code, grammar, "markup")
}

export function HtmlEditor({ value, onChange, ref }: HtmlEditorProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const selectionRef = useRef<{ start: number, end: number } | null>(null)
	const pendingSelectionRef = useRef<{ start: number, end: number } | null>(null)

	function rememberSelection() {
		const textarea = textareaRef.current
		if(!textarea) return

		selectionRef.current = {
			start: textarea.selectionStart,
			end: textarea.selectionEnd,
		}
	}

	function insertAtCursor(text: string) {
		const textarea = textareaRef.current
		const fallback = { start: value.length, end: value.length }
		const liveSelection = textarea && document.activeElement === textarea
			? { start: textarea.selectionStart, end: textarea.selectionEnd }
			: null
		const selection = liveSelection ?? selectionRef.current ?? fallback
		const nextValue = `${ value.slice(0, selection.start) }${ text }${ value.slice(selection.end) }`
		const cursor = selection.start + text.length
		pendingSelectionRef.current = { start: cursor, end: cursor }
		selectionRef.current = { start: cursor, end: cursor }
		onChange(nextValue)
	}

	useImperativeHandle(ref, () => ({
		insertAtCursor,
	}))

	useEffect(() => {
		function handleSelectionChange() {
			const textarea = textareaRef.current
			if(!textarea || document.activeElement !== textarea) {
				return
			}

			selectionRef.current = {
				start: textarea.selectionStart,
				end: textarea.selectionEnd,
			}
		}

		document.addEventListener("selectionchange", handleSelectionChange)
		return () => {
			document.removeEventListener("selectionchange", handleSelectionChange)
		}
	}, [])

	useEffect(() => {
		const pendingSelection = pendingSelectionRef.current
		const textarea = textareaRef.current
		if(!pendingSelection || !textarea) {
			return
		}

		pendingSelectionRef.current = null
		textarea.focus()
		textarea.setSelectionRange(pendingSelection.start, pendingSelection.end)
		selectionRef.current = pendingSelection
	}, [value])

	return (
		<Box className={ editorRoot }>
			<textarea
				ref={ textareaRef }
				id="signature-html-editor"
				value={ value }
				onChange={ (event) => {
					onChange(event.currentTarget.value)
				} }
				onSelect={ rememberSelection }
				onKeyUp={ rememberSelection }
				onClick={ rememberSelection }
				onBlur={ rememberSelection }
				spellCheck={ false }
				autoCapitalize="off"
				autoComplete="off"
				autoCorrect="off"
			/>
			<pre
				aria-hidden="true"
				dangerouslySetInnerHTML={ { __html: `${ highlightHtml(value) }\n` } }
			/>
		</Box>
	)
}
