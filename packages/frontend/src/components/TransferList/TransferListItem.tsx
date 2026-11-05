import { Text, UnstyledButton } from "@mantine/core"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import clsx from "clsx"

import { type TransferListOption } from "./partitionTransferListOptions"
import * as classes from "./TransferList.css"

export type TransferListSide = "choices" | "chosen"

interface TransferListItemProps {
	option: TransferListOption
	side: TransferListSide
	onMove: (optionValue: string) => void
}

export function TransferListItem({ option, side, onMove }: TransferListItemProps) {
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
