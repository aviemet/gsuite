import { Button, Text, TextInput } from "@mantine/core"
import clsx from "clsx"
import { type ChangeEvent, useId, useState } from "react"

import { type TransferListOption } from "./partitionTransferListOptions"
import * as classes from "./TransferList.css"
import { TransferListItem, type TransferListSide } from "./TransferListItem"

interface TransferListSidePanelProps {
	side: TransferListSide
	heading: string
	options: TransferListOption[]
	onMove: (optionValue: string) => void
	onClear?: () => void
	clearLabel: string
	clearAriaLabel: string
	searchPlaceholder: string
	nothingFoundMessage: string
	searchLabel: string
}

function listStatusMessage(side: TransferListSide, search: string, nothingFoundMessage: string) {
	if(search.trim().length > 0) return nothingFoundMessage
	if(side === "chosen") return "Nothing chosen"
	return "No choices left"
}

export function TransferListSidePanel({
	side,
	heading,
	options,
	onMove,
	onClear,
	clearLabel,
	clearAriaLabel,
	searchPlaceholder,
	nothingFoundMessage,
	searchLabel,
}: TransferListSidePanelProps) {
	const headingId = useId()
	const [search, setSearch] = useState("")

	function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
		setSearch(event.currentTarget.value)
	}

	const normalizedSearch = search.toLowerCase().trim()
	const filteredOptions = options.filter((option) => (
		option.label.toLowerCase().includes(normalizedSearch)
	))

	const items = filteredOptions.map((option) => (
		<TransferListItem
			key={ `${ side }-${ option.value }` }
			option={ option }
			side={ side }
			onMove={ onMove }
		/>
	))

	return (
		<section
			className={ clsx(classes.panel) }
			data-type={ side }
			aria-labelledby={ headingId }
		>
			<div className={ clsx(classes.header) }>
				<Text id={ headingId } component="div" size="sm" className={ clsx(classes.heading) }>
					{ heading }
				</Text>
				{ side === "chosen" && onClear && (
					<Button
						type="button"
						variant="light"
						color="harbor"
						size="compact-xs"
						disabled={ options.length === 0 }
						aria-label={ clearAriaLabel }
						onClick={ onClear }
					>
						{ clearLabel }
					</Button>
				) }
			</div>
			<TextInput
				placeholder={ searchPlaceholder }
				classNames={ { input: classes.search } }
				aria-label={ searchLabel }
				value={ search }
				onChange={ handleSearchChange }
			/>
			<div className={ clsx(classes.list) }>
				{ items.length > 0
					? items
					: (
						<Text size="sm" c="dimmed" className={ clsx(classes.empty) }>
							{ listStatusMessage(side, search, nothingFoundMessage) }
						</Text>
					) }
			</div>
		</section>
	)
}
