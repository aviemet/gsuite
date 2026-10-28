import { describe, expect, it } from "vitest"

import {
	contentOverflowsEditor,
	EDITOR_MAX_HEIGHT_PX,
	EDITOR_MIN_HEIGHT_PX,
	getEditorPlugins,
	getEditorSizeOptions,
	getPasteRetentionOptions,
	syncEditorOverflowScroll,
} from "@/frontend/components/RichTextEditor/editorSize"

describe("editorSize", () => {
	it("enables autoresize plugin alongside link and lists", () => {
		expect(getEditorPlugins()).toBe("link lists autoresize")
	})

	it("enables manual resize with a bottom toolbar and height bounds", () => {
		expect(getEditorSizeOptions()).toEqual({
			statusbar: false,
			resize: true,
			min_height: EDITOR_MIN_HEIGHT_PX,
			max_height: EDITOR_MAX_HEIGHT_PX,
			autoresize_bottom_margin: 0,
			toolbar_location: "bottom",
		})
	})

	it("keeps all pasted inline styles on webkit browsers", () => {
		expect(getPasteRetentionOptions()).toEqual({
			paste_webkit_styles: "all",
			paste_remove_styles_if_webkit: false,
		})
	})

	it("detects when body content exceeds the content area", () => {
		const body = document.createElement("div")
		Object.defineProperty(body, "scrollHeight", { value: 400 })
		const contentArea = document.createElement("div")
		Object.defineProperty(contentArea, "clientHeight", { value: 200 })

		expect(contentOverflowsEditor({
			getBody: () => body,
			getContentAreaContainer: () => contentArea,
		})).toBe(true)
	})

	it("enables overflow scroll when content exceeds the editor box", () => {
		const body = document.createElement("div")
		body.style.overflowY = "hidden"
		Object.defineProperty(body, "scrollHeight", { value: 400 })
		const contentArea = document.createElement("div")
		Object.defineProperty(contentArea, "clientHeight", { value: 200 })

		syncEditorOverflowScroll({
			getBody: () => body,
			getContentAreaContainer: () => contentArea,
		})

		expect(body.style.overflowY).toBe("auto")
	})

	it("keeps overflow hidden when content fits the editor box", () => {
		const body = document.createElement("div")
		body.style.overflowY = "auto"
		Object.defineProperty(body, "scrollHeight", { value: 180 })
		const contentArea = document.createElement("div")
		Object.defineProperty(contentArea, "clientHeight", { value: 200 })

		syncEditorOverflowScroll({
			getBody: () => body,
			getContentAreaContainer: () => contentArea,
		})

		expect(body.style.overflowY).toBe("hidden")
	})
})
