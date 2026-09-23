export const DEFAULT_TEXT_COLOR_SWATCHES = [
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
] as const

export const CUSTOM_SWATCHES_STORAGE_KEY = "rich-text-custom-swatches"

export function cssColorToHex(color: string): string | null {
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

export function normalizeHex(color: string): string | null {
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

export function parseStoredSwatches(value: string | undefined): string[] {
	if(typeof value !== "string") {
		return []
	}

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
			if(
				normalized
				&& !swatches.includes(normalized)
				&& !(DEFAULT_TEXT_COLOR_SWATCHES as readonly string[]).includes(normalized)
			) {
				swatches.push(normalized)
			}
		}

		return swatches
	} catch{
		return []
	}
}

export function stripLeadingHashes(value: string): string {
	return value.trim().replace(/^#+/, "")
}

export function hexDigitsFromColor(color: string): string {
	const normalized = normalizeHex(color)
	if(normalized) {
		return normalized.slice(1)
	}

	return stripLeadingHashes(color)
}

export function listIncludesColor(list: readonly string[], color: string): boolean {
	const normalized = normalizeHex(color)
	if(!normalized) {
		return false
	}

	return list.some((item) => normalizeHex(item) === normalized)
}
