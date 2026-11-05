import { Text, Title } from "@mantine/core"
import { type ReactNode } from "react"

import * as classes from "./ApiStatusPanel.css"
import { type ApiStatusRow, summarizeApiStatus } from "./apiStatusRows"
import { ApiStatusRowView } from "./ApiStatusRowView"
import { StatusMark } from "./StatusMark"

interface ApiStatusGroupProps {
	titleId: string
	title: string
	description: string
	rows: ApiStatusRow[]
	children?: ReactNode
}

export function ApiStatusGroup({ titleId, title, description, rows, children }: ApiStatusGroupProps) {
	const state = summarizeApiStatus(rows)

	return (
		<section className={ classes.section } aria-labelledby={ titleId }>
			<div className={ classes.groupHeading }>
				<StatusMark state={ state } />
				<Title id={ titleId } order={ 3 } size="h5">{ title }</Title>
			</div>
			<Text size="sm" c="dimmed">{ description }</Text>
			{ children }
			<div className={ classes.list }>
				{ rows.map((row) => (
					<ApiStatusRowView key={ row.id } row={ row } />
				)) }
			</div>
		</section>
	)
}
