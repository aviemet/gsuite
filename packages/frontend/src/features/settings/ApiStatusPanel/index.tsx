import { Button, Stack, Text, TextInput, Title } from "@mantine/core"
import { type ChangeEvent } from "react"

import { type ApiStatusResult } from "@/shared/workspace"

import { ApiStatusGroup } from "./ApiStatusGroup"
import * as classes from "./ApiStatusPanel.css"
import { apiStatusSummaryMessage, buildApiStatusRows, summarizeApiStatus } from "./apiStatusRows"
import { StatusMark } from "./StatusMark"

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
