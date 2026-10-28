import { MantineProvider } from "@mantine/core"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ComposeEditorShell } from "@/frontend/features/signatures/SignatureTemplateForm/ComposeEditorShell"
import { EmailPreviewFrame } from "@/frontend/features/signatures/SignatureTemplateForm/EmailPreviewFrame"

describe("signature editor chrome", () => {
	it("shows compose addressing around the editor", () => {
		const { unmount } = render(
			<MantineProvider>
				<ComposeEditorShell to="jane.doe@example.com" subject="Signature template preview">
					<div>editor body</div>
				</ComposeEditorShell>
			</MantineProvider>,
		)

		expect(screen.getByText("New message")).toBeInTheDocument()
		expect(screen.getByText("jane.doe@example.com")).toBeInTheDocument()
		expect(screen.getByText("Signature template preview")).toBeInTheDocument()
		expect(screen.getByText("editor body")).toBeInTheDocument()
		unmount()
	})

	it("shows preview sender details without decorative chrome copy beyond the badge", () => {
		const { unmount } = render(
			<MantineProvider>
				<EmailPreviewFrame senderName="Example Corp" senderEmail="jane.doe@example.com">
					<div>preview body</div>
				</EmailPreviewFrame>
			</MantineProvider>,
		)

		expect(screen.getByText("Example Corp")).toBeInTheDocument()
		expect(screen.getByText("jane.doe@example.com")).toBeInTheDocument()
		expect(screen.getByText("Preview · not sent")).toBeInTheDocument()
		expect(screen.getByText("preview body")).toBeInTheDocument()
		unmount()
	})
})
