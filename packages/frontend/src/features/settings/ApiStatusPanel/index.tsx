import { Button, Stack, Text, TextInput, Title } from "@mantine/core"
import { IconCircle, IconCircleCheck, IconCircleX, IconLoader2 } from "@tabler/icons-react"
import { type ChangeEvent, type ReactNode } from "react"

import { type ApiStatusResult } from "@/shared/workspace"

import * as classes from "./ApiStatusPanel.css"
import {
	type ApiStatusRow,
	apiStatusRowMessage,
	type ApiStatusRowState,
	apiStatusSummaryMessage,
	buildApiStatusRows,
	summarizeApiStatus,
} from "./apiStatusRows"

const statusIcons = {
	idle: IconCircle,
	checking: IconLoader2,
	success: IconCircleCheck,
	error: IconCircleX,
} as const

interface StatusMarkProps {
	state: ApiStatusRowState
}

function StatusMark({ state }: StatusMarkProps) {
	const Icon = statusIcons[state]
	return (
		<span className={ classes.mark } data-state={ state } aria-hidden>
			<Icon className={ classes.glyph } size={ 22 } stroke={ 1.75 } />
		</span>
	)
}

interface ApiStatusRowViewProps {
	row: ApiStatusRow
}

function statusTone(state: ApiStatusRowState) {
	if(state === "success") return "green"
	if(state === "error") return "red"
	return "dimmed"
}

function ApiStatusRowView({ row }: ApiStatusRowViewProps) {
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

interface ApiStatusGroupProps {
	titleId: string
	title: string
	description: string
	rows: ApiStatusRow[]
	children?: ReactNode
}

function ApiStatusGroup({ titleId, title, description, rows, children }: ApiStatusGroupProps) {
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

export interface ApiStatusPanelProps {
	userEmail: string
	isChecking: boolean
	results: readonly ApiStatusResult[] | undefined
	requestError?: string
	onUserEmailChange: (email: string) => void
	onCheck: (userEmail: string) => void
}

export function ApiStatusPanel({
	userEmail,
	isChecking,
	results,
	requestError,
	onUserEmailChange,
	onCheck,
}: ApiStatusPanelProps) {
	const rows = buildApiStatusRows(results, isChecking, requestError)
	const summary = summarizeApiStatus(rows)
	const adminRows = rows.filter((row) => row.group === "admin")
	const userRows = rows.filter((row) => row.group === "user")

	function handleUserEmailChange(event: ChangeEvent<HTMLInputElement>) {
		onUserEmailChange(event.currentTarget.value)
	}

	function handleCheck() {
		onCheck(userEmail)
	}

	return (
		<Stack gap="md">
			<div>
				<Title order={ 2 } size="h4">Google API status</Title>
			</div>
			<div
				className={ classes.summary }
				data-state={ summary }
				aria-live="polite"
			>
				<StatusMark state={ summary } />
				<Text size="sm">{ apiStatusSummaryMessage(summary) }</Text>
			</div>
			<ApiStatusGroup
				titleId="admin-apis"
				title="Admin APIs"
				description="Directory access as the Workspace admin."
				rows={ adminRows }
			/>
			<ApiStatusGroup
				titleId="user-apis"
				title="User APIs"
				description="Signature settings on one mailbox."
				rows={ userRows }
			>
				<TextInput
					label="Mailbox"
					description="The Gmail check reads signature settings on this mailbox. Check again after you change it."
					value={ userEmail }
					onChange={ handleUserEmailChange }
				/>
			</ApiStatusGroup>
			<Button
				loading={ isChecking }
				onClick={ handleCheck }
				style={ { alignSelf: "flex-start" } }
			>
				Check again
			</Button>
		</Stack>
	)
}
