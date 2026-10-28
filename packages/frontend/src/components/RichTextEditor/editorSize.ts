export const EDITOR_MIN_HEIGHT_PX = 256
export const EDITOR_MAX_HEIGHT_PX = 720

export function getEditorSizeOptions() {
	return {
		statusbar: false,
		resize: true as const,
		min_height: EDITOR_MIN_HEIGHT_PX,
		max_height: EDITOR_MAX_HEIGHT_PX,
		autoresize_bottom_margin: 0,
		toolbar_location: "bottom" as const,
	}
}

export function getEditorPlugins(): string {
	return "link lists autoresize"
}

export function getPasteRetentionOptions() {
	return {
		paste_webkit_styles: "all" as const,
		paste_remove_styles_if_webkit: false,
	}
}

interface OverflowScrollEditor {
	getBody: () => HTMLElement | null
	getContentAreaContainer: () => HTMLElement
}

export function contentOverflowsEditor(editor: OverflowScrollEditor): boolean {
	const body = editor.getBody()
	const contentArea = editor.getContentAreaContainer()
	if(!body) {
		return false
	}
	return body.scrollHeight > contentArea.clientHeight + 1
}

export function syncEditorOverflowScroll(editor: OverflowScrollEditor): void {
	const body = editor.getBody()
	if(!body) {
		return
	}
	body.style.overflowY = contentOverflowsEditor(editor) ? "auto" : "hidden"
}
