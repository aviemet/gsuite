import {
	ActionIcon,
	Box,
	Checkbox,
	Combobox,
	Group,
	Input,
	TextInput,
	useCombobox,
} from "@mantine/core"
import { IconChevronRight } from "@tabler/icons-react"
import clsx from "clsx"
import { type ChangeEvent, type ReactNode, useState } from "react"

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
	availableSearchLabel?: string
	selectedSearchLabel?: string
	transferToSelectedLabel?: string
	transferToAvailableLabel?: string
}

type TransferDirection = "forward" | "backward"

interface RenderListProps {
	options: TransferListOption[]
	onTransfer: (values: string[]) => void
	type: TransferDirection
	searchPlaceholder: string
	nothingFoundMessage: string
	searchLabel: string
	transferLabel: string
}

function RenderList({
	options,
	onTransfer,
	type,
	searchPlaceholder,
	nothingFoundMessage,
	searchLabel,
	transferLabel,
}: RenderListProps) {
	const combobox = useCombobox()
	const [selectedValues, setSelectedValues] = useState<string[]>([])
	const [search, setSearch] = useState("")

	function handleValueSelect(optionValue: string) {
		setSelectedValues((current) => (
			current.includes(optionValue)
				? current.filter((value) => value !== optionValue)
				: [...current, optionValue]
		))
	}

	function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
		setSearch(event.currentTarget.value)
		combobox.updateSelectedOptionIndex()
	}

	function handleTransferClick() {
		onTransfer(selectedValues)
		setSelectedValues([])
	}

	const filteredOptions = options.filter((option) => (
		option.label.toLowerCase().includes(search.toLowerCase().trim())
	))

	const items = filteredOptions.map((option) => (
		<Combobox.Option
			value={ option.value }
			key={ option.value }
			active={ selectedValues.includes(option.value) }
			onMouseOver={ () => combobox.resetSelectedOption() }
		>
			<Group gap="sm" wrap="nowrap">
				<Checkbox
					checked={ selectedValues.includes(option.value) }
					onChange={ () => {} }
					aria-hidden
					tabIndex={ -1 }
					style={ { pointerEvents: "none" } }
				/>
				<span>{ option.label }</span>
			</Group>
		</Combobox.Option>
	))

	return (
		<div className={ clsx(classes.panel) } data-type={ type }>
			<Combobox store={ combobox } onOptionSubmit={ handleValueSelect }>
				<Combobox.EventsTarget>
					<Group wrap="nowrap" gap={ 0 } className={ clsx(classes.controls) }>
						<TextInput
							placeholder={ searchPlaceholder }
							classNames={ { input: classes.input } }
							aria-label={ searchLabel }
							value={ search }
							onChange={ handleSearchChange }
							style={ { flex: 1 } }
						/>
						<ActionIcon
							radius={ 0 }
							variant="default"
							size={ 36 }
							className={ clsx(classes.control) }
							aria-label={ transferLabel }
							onClick={ handleTransferClick }
						>
							<IconChevronRight className={ clsx(classes.icon) } />
						</ActionIcon>
					</Group>
				</Combobox.EventsTarget>

				<div className={ clsx(classes.list) }>
					<Combobox.Options>
						{ items.length > 0
							? items
							: <Combobox.Empty>{ nothingFoundMessage }</Combobox.Empty> }
					</Combobox.Options>
				</div>
			</Combobox>
		</div>
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

export function TransferList({
	data,
	value,
	onChange,
	label,
	error,
	searchPlaceholder = "Search",
	nothingFoundMessage = "Nothing found",
	availableSearchLabel = "Search available",
	selectedSearchLabel = "Search selected",
	transferToSelectedLabel = "Transfer selected items to selected list",
	transferToAvailableLabel = "Transfer selected items to available list",
}: TransferListProps) {
	const { available, selected } = partitionOptions(data, value)

	function handleTransfer(transferFrom: TransferDirection, transferredValues: string[]) {
		if(transferredValues.length === 0) return

		if(transferFrom === "forward") {
			onChange([...value, ...transferredValues.filter((item) => !value.includes(item))])
			return
		}

		onChange(value.filter((item) => !transferredValues.includes(item)))
	}

	return (
		<Input.Wrapper label={ label } error={ error }>
			<Box className={ clsx(classes.root) }>
				<RenderList
					type="forward"
					options={ available }
					onTransfer={ (transferredValues) => handleTransfer("forward", transferredValues) }
					searchPlaceholder={ searchPlaceholder }
					nothingFoundMessage={ nothingFoundMessage }
					searchLabel={ availableSearchLabel }
					transferLabel={ transferToSelectedLabel }
				/>
				<RenderList
					type="backward"
					options={ selected }
					onTransfer={ (transferredValues) => handleTransfer("backward", transferredValues) }
					searchPlaceholder={ searchPlaceholder }
					nothingFoundMessage={ nothingFoundMessage }
					searchLabel={ selectedSearchLabel }
					transferLabel={ transferToAvailableLabel }
				/>
			</Box>
		</Input.Wrapper>
	)
}
