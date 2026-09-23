export const EDITOR_MIN_HEIGHT_PX = 256
export const EDITOR_MAX_HEIGHT_PX = 720

export function getEditorSizeOptions() {
	return {
		statusbar: true,
		resize: true as const,
		min_height: EDITOR_MIN_HEIGHT_PX,
		max_height: EDITOR_MAX_HEIGHT_PX,
		autoresize_bottom_margin: 0,
	}
}

export function getEditorPlugins(): string {
	return "link lists autoresize"
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
