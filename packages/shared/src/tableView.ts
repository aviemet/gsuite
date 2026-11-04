export const USER_SETTINGS_COLLECTION = "userSettings"

export const TABLE_RECORD_LIMITS = [10, 25, 50, 100] as const

export type TableRecordLimit = typeof TABLE_RECORD_LIMITS[number]

export const DEFAULT_TABLE_RECORD_LIMIT: TableRecordLimit = 25

export interface TableViewPreferences {
	visibleColumnIds: string[]
	recordLimit: TableRecordLimit
}

export interface UserSettings {
	tableViews: Record<string, TableViewPreferences>
	defaultTableRecordLimit: TableRecordLimit
	updatedAt: string
}

export function isTableRecordLimit(value: unknown): value is TableRecordLimit {
	return typeof value === "number"
		&& TABLE_RECORD_LIMITS.some((limit) => limit === value)
}
