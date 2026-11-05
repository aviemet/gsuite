export interface TableColumnDefinition<TRow> {
	id: Extract<keyof TRow, string>
	label: string
	defaultVisible: boolean
	getValue: (row: TRow) => string | number
}
