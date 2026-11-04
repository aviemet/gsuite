export function readString(value: Record<string, unknown> | undefined, key: string): string {
	const field = value?.[key]
	return typeof field === "string" ? field : ""
}

export function readBoolean(value: Record<string, unknown> | undefined, key: string): boolean {
	return value?.[key] === true
}
