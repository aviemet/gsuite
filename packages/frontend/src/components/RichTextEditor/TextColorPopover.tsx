import { Box, Button, ColorPicker, ColorSwatch, Popover, Stack, TextInput } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { useCallback, useEffect, useState } from "react"
import { type Editor as TinyMCEEditor } from "tinymce"

import {
	CUSTOM_SWATCHES_STORAGE_KEY,
	DEFAULT_TEXT_COLOR_SWATCHES,
	hexDigitsFromColor,
	listIncludesColor,
	normalizeHex,
	parseStoredSwatches,
	stripLeadingHashes,
} from "./textColorUtils"

function readSelectionColor(editor: TinyMCEEditor): string | null {
	const raw = editor.queryCommandValue("ForeColor")
	if(typeof raw !== "string" || raw.length === 0) {
		return null
	}

	return normalizeHex(raw)
}

interface TextColorPopoverProps {
	editor: TinyMCEEditor | null
	opened: boolean
	anchor: HTMLElement | null
	onClose: () => void
	onApplied: () => void
	restoreSelection: () => void
	rememberSelection: () => void
}

export function TextColorPopover({
	editor,
	opened,
	anchor,
	onClose,
	onApplied,
	restoreSelection,
	rememberSelection,
}: TextColorPopoverProps) {
	const [hexDraft, setHexDraft] = useState<string | null>(null)
	const [customSwatches, setCustomSwatches] = useLocalStorage<string[]>({
		key: CUSTOM_SWATCHES_STORAGE_KEY,
		defaultValue: [],
		deserialize: parseStoredSwatches,
	})

	const closePopover = useCallback(() => {
		setHexDraft(null)
		onClose()
	}, [onClose])

	useEffect(() => {
		if(!editor || !opened) {
			return
		}

		const closeFromEditor = () => {
			closePopover()
		}

		editor.on("click mousedown", closeFromEditor)
		return () => {
			editor.off("click mousedown", closeFromEditor)
		}
	}, [closePopover, editor, opened])

	const selectionColor = editor && opened ? readSelectionColor(editor) : null
	const pickerValue = selectionColor ?? "#000000"
	const hexInput = hexDraft ?? hexDigitsFromColor(pickerValue)
	const liveHex = normalizeHex(`#${hexInput}`) ?? pickerValue
	const swatches = [...DEFAULT_TEXT_COLOR_SWATCHES, ...customSwatches]
	const isDefaultSwatch = listIncludesColor(DEFAULT_TEXT_COLOR_SWATCHES, liveHex)
	const isCustomSwatch = listIncludesColor(customSwatches, liveHex)
	const canSaveSwatch = !isDefaultSwatch && !isCustomSwatch

	const applyColor = (value: string) => {
		const normalized = normalizeHex(value)
		if(!normalized || !editor) {
			return
		}

		restoreSelection()
		editor.execCommand("ForeColor", false, normalized)
		rememberSelection()
		onApplied()
	}

	const saveCustomSwatch = () => {
		if(!canSaveSwatch || listIncludesColor(swatches, liveHex)) {
			return
		}

		setCustomSwatches([...customSwatches, liveHex])
	}

	const removeCustomSwatch = () => {
		if(!isCustomSwatch) {
			return
		}

		setCustomSwatches(customSwatches.filter((swatch) => normalizeHex(swatch) !== liveHex))
	}

	if(!anchor) {
		return null
	}

	const anchorRect = anchor.getBoundingClientRect()

	return (
		<Popover
			opened={ opened }
			onChange={ (isOpened) => {
				if(!isOpened) {
					closePopover()
				}
			} }
			position="top"
			withinPortal
			shadow="md"
			offset={ 4 }
		>
			<Popover.Target>
				<Box
					style={ {
						position: "fixed",
						top: anchorRect.top,
						left: anchorRect.left,
						width: anchorRect.width,
						height: anchorRect.height,
						pointerEvents: "none",
						zIndex: 0,
					} }
				/>
			</Popover.Target>
			<Popover.Dropdown p="sm" data-text-color-popover="">
				<Stack gap="sm">
					<ColorPicker
						format="hex"
						size="sm"
						value={ liveHex }
						onChange={ (value) => {
							setHexDraft(hexDigitsFromColor(value))
							applyColor(value)
						} }
						swatches={ swatches }
						swatchesPerRow={ 7 }
					/>
					<TextInput
						size="xs"
						value={ hexInput }
						onChange={ (event) => {
							const digits = stripLeadingHashes(event.currentTarget.value)
							setHexDraft(digits)
							applyColor(`#${digits}`)
						} }
						onBlur={ () => {
							setHexDraft(null)
						} }
						aria-label="Hex color"
						placeholder="000000"
						leftSection="#"
						leftSectionPointerEvents="none"
						rightSection={ <ColorSwatch color={ liveHex } size={ 14 } /> }
						rightSectionPointerEvents="none"
						styles={ {
							input: {
								borderColor: liveHex,
								"--input-bd": liveHex,
								"--input-bd-focus": liveHex,
							},
						} }
					/>
					{ isCustomSwatch
						? (
							<Button
								size="xs"
								variant="default"
								leftSection={ <IconTrash size={ 14 } /> }
								onClick={ removeCustomSwatch }
							>
								Remove swatch
							</Button>
						)
						: (
							<Button
								size="xs"
								variant="default"
								leftSection={ <IconPlus size={ 14 } /> }
								disabled={ !canSaveSwatch }
								onClick={ saveCustomSwatch }
								styles={ {
									root: {
										borderColor: liveHex,
										"--button-bd": `1px solid ${liveHex}`,
									},
								} }
							>
								Save as swatch
							</Button>
						) }
				</Stack>
			</Popover.Dropdown>
		</Popover>
	)
}
