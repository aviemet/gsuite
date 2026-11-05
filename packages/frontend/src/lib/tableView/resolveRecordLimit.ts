import {
	DEFAULT_TABLE_RECORD_LIMIT,
	isTableRecordLimit,
	type TableRecordLimit,
	type TableViewPreferences,
	type UserSettings,
} from "@gsuite/shared"

export function resolveRecordLimit(
	viewPreferences: TableViewPreferences | undefined,
	settings: Pick<UserSettings, "defaultTableRecordLimit"> | undefined,
): TableRecordLimit {
	if(viewPreferences && isTableRecordLimit(viewPreferences.recordLimit)) {
		return viewPreferences.recordLimit
	}

	if(settings && isTableRecordLimit(settings.defaultTableRecordLimit)) {
		return settings.defaultTableRecordLimit
	}

	return DEFAULT_TABLE_RECORD_LIMIT
}

export function normalizeRecordLimit(value: unknown): TableRecordLimit | undefined {
	return isTableRecordLimit(value) ? value : undefined
}
