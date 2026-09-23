import { MantineProvider } from "@mantine/core"
import { render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const editorPropsLog: Array<{ initialValue?: string }> = []

vi.mock("@tinymce/tinymce-react", () => ({
	Editor: (props: { initialValue?: string }) => {
		editorPropsLog.push({ initialValue: props.initialValue })
		return <div data-testid="tinymce-stub" />
	},
}))

vi.mock("@/frontend/components/RichTextEditor/tinymceSetup", () => ({}))

vi.mock("@/frontend/components/RichTextEditor/textColorButton", () => ({
	registerTextColorButton: vi.fn(),
}))

import { RichTextEditor } from "@/frontend/components/RichTextEditor"

describe("RichTextEditor initialValue stability", () => {
	beforeEach(() => {
		editorPropsLog.length = 0
	})

	it("keeps initialValue stable when value changes after mount", () => {
		const { rerender } = render(
			<MantineProvider>
				<RichTextEditor
					value="<div>one</div>"
					onChange={ vi.fn() }
				/>
			</MantineProvider>,
		)

		expect(editorPropsLog[0]?.initialValue).toBe("<div>one</div>")

		rerender(
			<MantineProvider>
				<RichTextEditor
					value="<div>two</div>"
					onChange={ vi.fn() }
				/>
			</MantineProvider>,
		)

		expect(editorPropsLog.at(-1)?.initialValue).toBe("<div>one</div>")
	})
})
