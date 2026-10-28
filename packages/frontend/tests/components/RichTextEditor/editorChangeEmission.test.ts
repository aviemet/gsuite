import { describe, expect, it } from "vitest"

import { resolveEditorChangeEmission } from "@/frontend/components/RichTextEditor/editorChangeEmission"

describe("resolveEditorChangeEmission", () => {
	it("consumes a one-shot skip without emitting", () => {
		expect(resolveEditorChangeEmission({
			skipNext: true,
			html: "<div>pasted</div>",
			lastEmittedHtml: "",
		})).toEqual({
			skipNext: false,
			lastEmittedHtml: "<div>pasted</div>",
			emitHtml: null,
		})
	})

	it("emits the next change after the skip has been consumed", () => {
		expect(resolveEditorChangeEmission({
			skipNext: false,
			html: "<div>pasted</div>",
			lastEmittedHtml: "",
		})).toEqual({
			skipNext: false,
			lastEmittedHtml: "<div>pasted</div>",
			emitHtml: "<div>pasted</div>",
		})
	})

	it("does not emit when html is unchanged", () => {
		expect(resolveEditorChangeEmission({
			skipNext: false,
			html: "<div>same</div>",
			lastEmittedHtml: "<div>same</div>",
		})).toEqual({
			skipNext: false,
			lastEmittedHtml: "<div>same</div>",
			emitHtml: null,
		})
	})
})
