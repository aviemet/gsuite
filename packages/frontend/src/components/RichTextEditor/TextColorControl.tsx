import { Button, ColorPicker, ColorSwatch, Popover, Stack, TextInput, Tooltip } from "@mantine/core"
import { useDisclosure, useLocalStorage } from "@mantine/hooks"
import { RichTextEditor, useRichTextEditorContext } from "@mantine/tiptap"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { useEffect, useState } from "react"

const DEFAULT_SWATCHES = [
	"#25262b",
	"#868e96",
	"#fa5252",
	"#e64980",
	"#be4bdb",
	"#7950f2",
	"#4c6ef5",
	"#228be6",
	"#15aabf",
	"#12b886",
	"#40c057",
	"#82c91e",
	"#fab005",
	"#fd7e14",
]

const CUSTOM_SWATCHES_STORAGE_KEY = "rich-text-custom-swatches"

function cssColorToHex(color: string): string | null {
	if(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) {
		return color
	}

	const rgbMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(color)
	if(!rgbMatch) {
		return null
	}

	const toHex = (channel: string) => Number(channel).toString(16).padStart(2, "0")
	return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`
}

function normalizeHex(color: string): string | null {
	const converted = cssColorToHex(color)
	if(!converted) {
		return null
	}

	const hex = converted.toLowerCase()
	if(/^#[0-9a-f]{3}$/.test(hex)) {
		return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
	}

	if(/^#[0-9a-f]{8}$/.test(hex)) {
		return hex.slice(0, 7)
	}

	if(/^#[0-9a-f]{6}$/.test(hex)) {
		return hex
	}

	return null
}

function parseStoredSwatches(value: string): string[] {
	try {
		const parsed: unknown = JSON.parse(value)
		if(!Array.isArray(parsed)) {
			return []
		}

		const swatches: string[] = []
		for(const item of parsed) {
			if(typeof item !== "string") {
				continue
			}

			const normalized = normalizeHex(item)
			if(normalized && !swatches.includes(normalized) && !DEFAULT_SWATCHES.includes(normalized)) {
				swatches.push(normalized)
			}
		}

		return swatches
	} catch{
		return []
	}
}

function stripLeadingHashes(value: string): string {
	return value.trim().replace(/^#+/, "")
}

function hexDigitsFromColor(color: string): string {
	const normalized = normalizeHex(color)
	if(normalized) {
		return normalized.slice(1)
	}

	return stripLeadingHashes(color)
}

function listIncludesColor(list: string[], color: string): boolean {
	const normalized = normalizeHex(color)
	if(!normalized) {
		return false
	}

	return list.some((item) => normalizeHex(item) === normalized)
}

export function TextColorControl() {
	const { editor } = useRichTextEditorContext()
	const [opened, { toggle, close }] = useDisclosure(false)
	const [controlElement, setControlElement] = useState<HTMLButtonElement | null>(null)
	const [hexFocused, setHexFocused] = useState(false)
	const [hexInput, setHexInput] = useState("000000")
	const [customSwatches, setCustomSwatches] = useLocalStorage<string[]>({
		key: CUSTOM_SWATCHES_STORAGE_KEY,
		defaultValue: [],
		deserialize: parseStoredSwatches,
	})
	const activeColor = editor?.getAttributes("textStyle").color
	const hexColor = typeof activeColor === "string" ? normalizeHex(activeColor) : null
	const hasColor = hexColor !== null
	const pickerValue = hexColor ?? "#000000"
	const swatchColor = hexColor ?? "var(--mantine-color-text)"
	const swatches = [...DEFAULT_SWATCHES, ...customSwatches]
	const isDefaultSwatch = hexColor !== null && listIncludesColor(DEFAULT_SWATCHES, hexColor)
	const isCustomSwatch = hexColor !== null && listIncludesColor(customSwatches, hexColor)
	const canSaveSwatch = hexColor !== null && !isDefaultSwatch && !isCustomSwatch

	useEffect(() => {
		if(!hexFocused) {
			setHexInput(hexDigitsFromColor(pickerValue))
		}
	}, [pickerValue, hexFocused])

	const applyColor = (value: string, shouldFocus = true) => {
		const normalized = normalizeHex(value)
		if(!normalized || !editor) {
			return
		}

		const chain = shouldFocus ? editor.chain().focus() : editor.chain()
		chain.setColor(normalized).run()
	}

	const saveCustomSwatch = () => {
		if(hexColor === null || listIncludesColor(swatches, hexColor)) {
			return
		}

		setCustomSwatches([...customSwatches, hexColor])
	}

	const removeCustomSwatch = () => {
		if(hexColor === null) {
			return
		}

		setCustomSwatches(customSwatches.filter((swatch) => normalizeHex(swatch) !== hexColor))
	}

	return (
		<>
			{ controlElement !== null && (
				<Tooltip
					label="Text color"
					withArrow
					openDelay={ 250 }
					disabled={ opened }
					target={ controlElement }
				/>
			) }
			<Popover
				opened={ opened }
				onChange={ (isOpened) => {
					if(!isOpened) {
						close()
					}
				} }
				position="bottom"
				withinPortal
				shadow="md"
			>
				<Popover.Target>
					<RichTextEditor.Control
						ref={ setControlElement }
						onClick={ toggle }
						aria-label="Text color"
						title=""
						active={ hasColor }
					>
						<ColorSwatch color={ swatchColor } size={ 14 } />
					</RichTextEditor.Control>
				</Popover.Target>
				<Popover.Dropdown p="sm" data-text-color-popover="">
					<Stack gap="sm">
						<ColorPicker
							format="hex"
							size="sm"
							value={ pickerValue }
							onChange={ (value) => {
								setHexInput(hexDigitsFromColor(value))
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
								setHexInput(digits)
								applyColor(`#${digits}`, false)
							} }
							onFocus={ () => setHexFocused(true) }
							onBlur={ () => {
								setHexFocused(false)
								setHexInput(hexDigitsFromColor(pickerValue))
							} }
							aria-label="Hex color"
							placeholder="000000"
							leftSection="#"
							leftSectionPointerEvents="none"
							rightSection={ <ColorSwatch color={ pickerValue } size={ 14 } /> }
							rightSectionPointerEvents="none"
							styles={ {
								input: {
									borderColor: pickerValue,
									"--input-bd": pickerValue,
									"--input-bd-focus": pickerValue,
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
											borderColor: pickerValue,
											"--button-bd": `1px solid ${pickerValue}`,
										},
									} }
								>
									Save as swatch
								</Button>
							) }
					</Stack>
				</Popover.Dropdown>
			</Popover>
		</>
	)
}
