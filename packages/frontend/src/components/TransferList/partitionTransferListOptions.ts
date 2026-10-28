import { uniquePreserveOrder } from "@/shared/uniquePreserveOrder"

export interface TransferListOption {
	value: string
	label: string
	disabled?: boolean
	disabledReason?: string
}

export function partitionTransferListOptions(
	data: readonly TransferListOption[],
	value: readonly string[],
): {
	available: TransferListOption[]
	selected: TransferListOption[]
} {
	const selectedValues = uniquePreserveOrder(value)
	const selectedValueSet = new Set(selectedValues)
	const available = data.filter((option) => !selectedValueSet.has(option.value))
	const selected = selectedValues.map((selectedValue) => {
		const match = data.find((option) => option.value === selectedValue)
		return match ?? { value: selectedValue, label: selectedValue }
	})
	return { available, selected }
}

export function nextTransferListValueAfterAdd(
	value: readonly string[],
	optionValue: string,
	data: readonly TransferListOption[],
): string[] | null {
	const option = data.find((entry) => entry.value === optionValue)
	if(option?.disabled) return null
	const selectedValues = uniquePreserveOrder(value)
	if(selectedValues.includes(optionValue)) return null
	return [...selectedValues, optionValue]
}

export function nextTransferListValueAfterRemove(
	value: readonly string[],
	optionValue: string,
): string[] {
	return uniquePreserveOrder(value).filter((item) => item !== optionValue)
}
