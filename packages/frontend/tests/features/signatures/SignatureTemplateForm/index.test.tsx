import { MantineProvider } from "@mantine/core"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SignatureTemplateForm } from "@/frontend/features/signatures/SignatureTemplateForm"

vi.mock("@/frontend/components/RichTextEditor", () => ({
	RichTextEditor: () => <div>visual editor</div>,
}))

function renderForm(content: string, onContentChange: (content: string) => void) {
	return render(
		<MantineProvider>
			<SignatureTemplateForm
				name="Template"
				onNameChange={ vi.fn() }
				content={ content }
				onContentChange={ onContentChange }
			/>
		</MantineProvider>,
	)
}

describe("SignatureTemplateForm", () => {
	it("indents the HTML when switching to the code view", () => {
		const onContentChange = vi.fn()
		const { unmount } = renderForm("<div><p>{{fullName}}</p></div>", onContentChange)

		fireEvent.click(screen.getByText("Code"))

		expect(onContentChange).toHaveBeenCalledWith("<div>\n  <p>{{fullName}}</p>\n</div>")
		unmount()
	})

	it("does not report a change when the HTML is already indented", () => {
		const onContentChange = vi.fn()
		const { unmount } = renderForm("<div>\n  <p>{{fullName}}</p>\n</div>", onContentChange)

		fireEvent.click(screen.getByText("Code"))

		expect(onContentChange).not.toHaveBeenCalled()
		unmount()
	})
})
