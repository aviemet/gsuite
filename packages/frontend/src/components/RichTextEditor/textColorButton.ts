import { type Editor as TinyMCEEditor } from "tinymce"

export const TEXT_COLOR_BUTTON_NAME = "signatureforecolor"

export interface TextColorButtonOptions {
	onToggle: (anchor: HTMLElement) => void
}

function findToolbarButton(editor: TinyMCEEditor): HTMLElement | null {
	const button = editor.getContainer().querySelector(`[data-mce-name="${TEXT_COLOR_BUTTON_NAME}"]`)
	return button instanceof HTMLElement ? button : null
}

export function registerTextColorButton(editor: TinyMCEEditor, options: TextColorButtonOptions): void {
	editor.ui.registry.addToggleButton(TEXT_COLOR_BUTTON_NAME, {
		tooltip: "Text color",
		icon: "text-color",
		onAction: () => {
			const anchor = findToolbarButton(editor)
			if(!anchor) {
				return
			}

			options.onToggle(anchor)
		},
		onSetup: (buttonApi) => {
			const sync = () => {
				const raw = editor.queryCommandValue("ForeColor")
				buttonApi.setActive(typeof raw === "string" && raw.length > 0)
			}

			sync()
			editor.on("NodeChange", sync)
			return () => {
				editor.off("NodeChange", sync)
			}
		},
	})
}
