import { Input } from "@mantine/core"
import clsx from "clsx"
import { type ReactNode } from "react"

import {
	nextTransferListValueAfterAdd,
	nextTransferListValueAfterRemove,
	partitionTransferListOptions,
	type TransferListOption,
} from "./partitionTransferListOptions"
import * as classes from "./TransferList.css"
import { TransferListSidePanel } from "./TransferListSidePanel"

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
