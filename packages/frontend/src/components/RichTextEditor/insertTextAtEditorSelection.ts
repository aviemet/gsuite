import { type Bookmark } from "tinymce"

export interface SelectionAwareEditor {
	destroyed: boolean
	hasFocus: () => boolean
	focus: () => void
	insertContent: (content: string) => void
	selection: {
		getBookmark: (type?: number, normalized?: boolean) => Bookmark
		moveToBookmark: (bookmark: Bookmark) => void
	}
}

export type EditorSelectionBookmark = Bookmark

export function readEditorSelectionBookmark(
	editor: SelectionAwareEditor,
): EditorSelectionBookmark | null {
	if(editor.destroyed) {
		return null
	}

	return editor.selection.getBookmark(2, true)
}

export function insertTextAtEditorSelection(
	editor: SelectionAwareEditor,
	text: string,
	bookmark: EditorSelectionBookmark | null,
): EditorSelectionBookmark | null {
	if(editor.destroyed) {
		return bookmark
	}

	if(editor.hasFocus()) {
		editor.insertContent(text)
		return readEditorSelectionBookmark(editor)
	}

	editor.focus()
	if(bookmark) {
		editor.selection.moveToBookmark(bookmark)
	}

	editor.insertContent(text)
	return readEditorSelectionBookmark(editor)
}
