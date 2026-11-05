import {
	DEFAULT_TABLE_RECORD_LIMIT,
	isTableRecordLimit,
	type TableViewPreferences,
	type UserSettings,
} from "@gsuite/shared"

function hasKey(value: object, key: string): boolean {
	return Object.prototype.hasOwnProperty.call(value, key)
}

function readString(value: object, key: string): string | undefined {
	if(!hasKey(value, key)) return undefined
	const field = Reflect.get(value, key)
	if(typeof field !== "string" || field.length === 0) return undefined
	return field
}

function parseTableViewPreferences(value: unknown): TableViewPreferences | undefined {
	if(!value || typeof value !== "object") return undefined
	if(!hasKey(value, "visibleColumnIds")) return undefined
	const visibleColumnIdsValue = Reflect.get(value, "visibleColumnIds")
	if(!Array.isArray(visibleColumnIdsValue)) return undefined
	const visibleColumnIds = visibleColumnIdsValue.filter((entry): entry is string => typeof entry === "string")

	const recordLimitValue = hasKey(value, "recordLimit")
		? Reflect.get(value, "recordLimit")
		: undefined
	if(!isTableRecordLimit(recordLimitValue)) return undefined

	return {
		visibleColumnIds,
		recordLimit: recordLimitValue,
	}
}

export function parseUserSettings(value: unknown): UserSettings {
	if(!value || typeof value !== "object") {
		return emptyUserSettings()
	}

	const rawDefaultTableRecordLimit = hasKey(value, "defaultTableRecordLimit")
		? Reflect.get(value, "defaultTableRecordLimit")
		: undefined
	const defaultTableRecordLimit = isTableRecordLimit(rawDefaultTableRecordLimit)
		? rawDefaultTableRecordLimit
		: DEFAULT_TABLE_RECORD_LIMIT

	const updatedAt = readString(value, "updatedAt") ?? new Date(0).toISOString()
	const tableViews: Record<string, TableViewPreferences> = {}

	if(hasKey(value, "tableViews")) {
		const tableViewsValue = Reflect.get(value, "tableViews")
		if(tableViewsValue && typeof tableViewsValue === "object") {
			for(const [viewId, viewValue] of Object.entries(tableViewsValue)) {
				const parsedView = parseTableViewPreferences(viewValue)
				if(parsedView) tableViews[viewId] = parsedView
			}
		}
	}

	return {
		tableViews,
		defaultTableRecordLimit,
		updatedAt,
	}
}

export function emptyUserSettings(): UserSettings {
	return {
		tableViews: {},
		defaultTableRecordLimit: DEFAULT_TABLE_RECORD_LIMIT,
		updatedAt: new Date(0).toISOString(),
	}
}
