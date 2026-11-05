import { Text } from "@mantine/core"

import * as classes from "./ApiStatusPanel.css"
import { type ApiStatusRow, apiStatusRowMessage, type ApiStatusRowState } from "./apiStatusRows"
import { StatusMark } from "./StatusMark"

interface ApiStatusRowViewProps {
	row: ApiStatusRow
}

function statusTone(state: ApiStatusRowState) {
	if(state === "success") return "green"
	if(state === "error") return "red"
	return "dimmed"
}

export function ApiStatusRowView({ row }: ApiStatusRowViewProps) {
	const message = apiStatusRowMessage(row)

	return (
		<div className={ classes.row }>
			<StatusMark state={ row.state } />
			<div>
				<Text size="sm">{ row.label }</Text>
				<Text size="xs" c={ statusTone(row.state) }>{ message }</Text>
			</div>
		</div>
	)
}
