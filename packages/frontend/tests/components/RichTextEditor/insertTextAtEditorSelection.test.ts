import { type Bookmark } from "tinymce"
import { describe, expect, it, vi } from "vitest"

import {
	insertTextAtEditorSelection,
	readEditorSelectionBookmark,
	type SelectionAwareEditor,
} from "@/frontend/components/RichTextEditor/insertTextAtEditorSelection"

function createEditor(options?: {
	hasFocus?: boolean
	bookmark?: Bookmark
}): SelectionAwareEditor & {
	inserted: string[]
	movedTo: Bookmark[]
} {
	const inserted: string[] = []
	const movedTo: Bookmark[] = []
	let bookmark = options?.bookmark ?? { id: "current" }

	return {
		inserted,
		movedTo,
		destroyed: false,
		hasFocus: () => options?.hasFocus ?? false,
		focus: vi.fn(),
		insertContent: (content: string) => {
			inserted.push(content)
		},
		selection: {
			getBookmark: () => bookmark,
			moveToBookmark: (nextBookmark) => {
				movedTo.push(nextBookmark)
				bookmark = nextBookmark
			},
		},
	}
}

describe("insertTextAtEditorSelection", () => {
	it("inserts into the live selection when the editor still has focus", () => {
		const editor = createEditor({ hasFocus: true, bookmark: { id: "live" } })

		const nextBookmark = insertTextAtEditorSelection(
			editor,
			"{{fullName}}",
			{ id: "stale" },
		)

		expect(editor.focus).not.toHaveBeenCalled()
		expect(editor.movedTo).toEqual([])
		expect(editor.inserted).toEqual(["{{fullName}}"])
		expect(nextBookmark).toEqual({ id: "live" })
	})

	it("restores the saved bookmark before inserting when focus was lost", () => {
		const editor = createEditor({ hasFocus: false, bookmark: { id: "after" } })
		const savedBookmark = { id: "selection" }

		insertTextAtEditorSelection(editor, "{{email}}", savedBookmark)

		expect(editor.focus).toHaveBeenCalledOnce()
		expect(editor.movedTo).toEqual([savedBookmark])
		expect(editor.inserted).toEqual(["{{email}}"])
	})

	it("focuses and inserts without moving when there is no bookmark", () => {
		const editor = createEditor({ hasFocus: false })

		insertTextAtEditorSelection(editor, "{{jobTitle}}", null)

		expect(editor.focus).toHaveBeenCalledOnce()
		expect(editor.movedTo).toEqual([])
		expect(editor.inserted).toEqual(["{{jobTitle}}"])
	})

	it("reads a normalized bookmark from the editor selection", () => {
		const editor = createEditor({ bookmark: { id: "node" } })
		expect(readEditorSelectionBookmark(editor)).toEqual({ id: "node" })
	})
})
