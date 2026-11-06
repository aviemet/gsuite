import { type ColumnFilters, type ColumnFilterState } from "./columnFilterState"

function storageKey(viewId: string): string {
	return `suiteocean.tableFilters.${ viewId }`
}

function readStringArray(value: unknown): string[] | undefined {
	if(!Array.isArray(value)) return undefined
	const strings: string[] = []
	for(const entry of value) {
		if(typeof entry !== "string") return undefined
		strings.push(entry)
	}
	return strings
}

function readColumnFilterState(value: unknown): ColumnFilterState | undefined {
	if(!value || typeof value !== "object") return undefined
	if(!("query" in value) || !("selectedValues" in value)) return undefined
	const query = Reflect.get(value, "query")
	const selectedValues = Reflect.get(value, "selectedValues")
	if(typeof query !== "string") return undefined
	if(selectedValues === null) return { query, selectedValues: null }
	const values = readStringArray(selectedValues)
	if(!values) return undefined
	return { query, selectedValues: values }
}

function readStoredFilters(stored: string): ColumnFilters {
	let parsed: unknown
	try {
		parsed = JSON.parse(stored)
	} catch{
		return {}
	}
	if(!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}

	const filters: ColumnFilters = {}
	for(const [columnId, value] of Object.entries(parsed)) {
		const filter = readColumnFilterState(value)
		if(filter) filters[columnId] = filter
	}
	return filters
}

export function readSessionColumnFilters(viewId: string): ColumnFilters {
	try {
		const stored = sessionStorage.getItem(storageKey(viewId))
		if(!stored) return {}
		return readStoredFilters(stored)
	} catch{
		return {}
	}
}

export function writeSessionColumnFilters(viewId: string, filters: ColumnFilters): void {
	try {
		const key = storageKey(viewId)
		if(Object.keys(filters).length === 0) {
			sessionStorage.removeItem(key)
			return
		}
		sessionStorage.setItem(key, JSON.stringify(filters))
	} catch{
		return
	}
}
