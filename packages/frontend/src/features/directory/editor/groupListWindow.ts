export const GROUP_ROW_HEIGHT = 52
export const GROUP_LIST_HEIGHT = 320

const OVERSCAN_ROWS = 4

export function groupListWindow(scrollTop: number, rowCount: number): { start: number, end: number } {
	if(rowCount <= 0) return { start: 0, end: 0 }
	const firstVisibleRow = Math.floor(Math.max(0, scrollTop) / GROUP_ROW_HEIGHT)
	const visibleRowCount = Math.ceil(GROUP_LIST_HEIGHT / GROUP_ROW_HEIGHT)
	const start = Math.max(0, firstVisibleRow - OVERSCAN_ROWS)
	const end = Math.min(rowCount, firstVisibleRow + visibleRowCount + OVERSCAN_ROWS)
	return { start, end }
}
