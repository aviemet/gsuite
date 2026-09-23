import { MantineProvider } from "@mantine/core"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { type Editor as TinyMCEEditor } from "tinymce"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TextColorPopover } from "@/frontend/components/RichTextEditor/TextColorPopover"

afterEach(() => {
	cleanup()
})

function renderPopover() {
	const execCommand = vi.fn()
	const editor = {
		queryCommandValue: vi.fn(() => "#e64980"),
		execCommand,
		on: vi.fn(),
		off: vi.fn(),
	} as unknown as TinyMCEEditor

	const anchor = document.createElement("button")
	document.body.appendChild(anchor)

	const onClose = vi.fn()
	const onApplied = vi.fn()
	const restoreSelection = vi.fn()
	const rememberSelection = vi.fn()

	render(
		<MantineProvider>
			<TextColorPopover
				editor={ editor }
				opened={ true }
				anchor={ anchor }
				onClose={ onClose }
				onApplied={ onApplied }
				restoreSelection={ restoreSelection }
				rememberSelection={ rememberSelection }
			/>
		</MantineProvider>,
	)

	return {
		execCommand,
		onApplied,
		restoreSelection,
		rememberSelection,
	}
}

describe("TextColorPopover", () => {
	it("applies ForeColor when a swatch is chosen", async () => {
		const user = userEvent.setup()
		const { execCommand, onApplied, restoreSelection, rememberSelection } = renderPopover()

		await user.click(screen.getByRole("button", { name: "#228be6" }))

		expect(restoreSelection).toHaveBeenCalled()
		expect(execCommand).toHaveBeenCalledWith("ForeColor", false, "#228be6")
		expect(rememberSelection).toHaveBeenCalled()
		expect(onApplied).toHaveBeenCalled()
	})
})
