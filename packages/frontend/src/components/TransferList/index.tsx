import { Button, Input, Text, TextInput, UnstyledButton } from "@mantine/core"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import clsx from "clsx"
import { type ChangeEvent, type ReactNode, useId, useState } from "react"

import {
	nextTransferListValueAfterAdd,
	nextTransferListValueAfterRemove,
	partitionTransferListOptions,
	type TransferListOption,
} from "./partitionTransferListOptions"
import * as classes from "./TransferList.css"

export type { TransferListOption }

export interface TransferListProps {
	data: TransferListOption[]
	value: string[]
	onChange: (value: string[]) => void
	label?: ReactNode
	error?: ReactNode
	searchPlaceholder?: string
	nothingFoundMessage?: string
	choicesLabel?: string
	chosenLabel?: string
	choicesSearchLabel?: string
	chosenSearchLabel?: string
	clearLabel?: string
}

type TransferListSide = "choices" | "chosen"

interface TransferListItemProps {
	option: TransferListOption
	side: TransferListSide
	onMove: (optionValue: string) => void
}

function TransferListItem({ option, side, onMove }: TransferListItemProps) {
	const DirectionIcon = side === "choices" ? IconArrowRight : IconArrowLeft
	const actionVerb = side === "choices" ? "Add" : "Remove"
	const isDisabled = side === "choices" && option.disabled === true

	function handleClick() {
		if(isDisabled) return
		onMove(option.value)
	}

	const action = (
		<span className={ clsx(classes.itemAction) } data-action aria-hidden="true">
			<DirectionIcon size={ 14 } />
		</span>
	)

	return (
		<UnstyledButton
			type="button"
			className={ clsx(classes.item) }
			data-disabled={ isDisabled }
			disabled={ isDisabled }
			aria-label={ `${ actionVerb } ${ option.label }` }
			onClick={ handleClick }
		>
			{ side === "chosen" && action }
			<Text component="span" size="sm" truncate className={ clsx(classes.itemLabel) }>
				{ option.label }
			</Text>
			{ isDisabled && option.disabledReason && (
				<Text component="span" size="xs" truncate className={ clsx(classes.itemReason) }>
					{ option.disabledReason }
				</Text>
			) }
			{ side === "choices" && !isDisabled && action }
		</UnstyledButton>
	)
}

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

function TransferListSidePanel({
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

function clearAllAriaLabel(label: ReactNode, clearLabel: string) {
	if(typeof label === "string" && label.trim().length > 0) {
		return `${ clearLabel } ${ label.trim().toLowerCase() }`
	}
	return clearLabel
}

export function TransferList({
	data,
	value,
	onChange,
	label,
	error,
	searchPlaceholder = "Search",
	nothingFoundMessage = "Nothing found",
	choicesLabel = "Choices",
	chosenLabel = "Chosen",
	choicesSearchLabel = "Search choices",
	chosenSearchLabel = "Search chosen",
	clearLabel = "Clear all",
}: TransferListProps) {
	const { available, selected } = partitionTransferListOptions(data, value)
	const clearAriaLabel = clearAllAriaLabel(label, clearLabel)

	function handleAdd(optionValue: string) {
		const nextValue = nextTransferListValueAfterAdd(value, optionValue, data)
		if(!nextValue) return
		onChange(nextValue)
	}

	function handleRemove(optionValue: string) {
		onChange(nextTransferListValueAfterRemove(value, optionValue))
	}

	function handleClear() {
		if(value.length === 0) return
		onChange([])
	}

	return (
		<Input.Wrapper
			label={ label }
			error={ error }
			classNames={ { label: classes.fieldLabel } }
		>
			<div className={ clsx(classes.root) }>
				<TransferListSidePanel
					side="choices"
					heading={ choicesLabel }
					options={ available }
					onMove={ handleAdd }
					clearLabel={ clearLabel }
					clearAriaLabel={ clearAriaLabel }
					searchPlaceholder={ searchPlaceholder }
					nothingFoundMessage={ nothingFoundMessage }
					searchLabel={ choicesSearchLabel }
				/>
				<TransferListSidePanel
					side="chosen"
					heading={ chosenLabel }
					options={ selected }
					onMove={ handleRemove }
					onClear={ handleClear }
					clearLabel={ clearLabel }
					clearAriaLabel={ clearAriaLabel }
					searchPlaceholder={ searchPlaceholder }
					nothingFoundMessage={ nothingFoundMessage }
					searchLabel={ chosenSearchLabel }
				/>
			</div>
		</Input.Wrapper>
	)
}
