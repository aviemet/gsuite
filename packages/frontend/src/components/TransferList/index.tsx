import { Button, Input, Text, TextInput, UnstyledButton } from "@mantine/core"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import clsx from "clsx"
import { type ChangeEvent, type ReactNode, useId, useState } from "react"

import * as classes from "./TransferList.css"

export interface TransferListOption {
	value: string
	label: string
}

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

	function handleClick() {
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
			aria-label={ `${ actionVerb } ${ option.label }` }
			onClick={ handleClick }
		>
			{ side === "chosen" && action }
			<Text component="span" size="sm" truncate className={ clsx(classes.itemLabel) }>
				{ option.label }
			</Text>
			{ side === "choices" && action }
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
			key={ option.value }
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

function partitionOptions(data: TransferListOption[], value: string[]) {
	const selectedValueSet = new Set(value)
	const available = data.filter((option) => !selectedValueSet.has(option.value))
	const selected = value.map((selectedValue) => {
		const match = data.find((option) => option.value === selectedValue)
		return match ?? { value: selectedValue, label: selectedValue }
	})
	return { available, selected }
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
	const { available, selected } = partitionOptions(data, value)
	const clearAriaLabel = clearAllAriaLabel(label, clearLabel)

	function handleAdd(optionValue: string) {
		if(value.includes(optionValue)) return
		onChange([...value, optionValue])
	}

	function handleRemove(optionValue: string) {
		onChange(value.filter((item) => item !== optionValue))
	}

	function handleClear() {
		if(value.length === 0) return
		onChange([])
	}

	return (
		<Input.Wrapper label={ label } error={ error }>
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
