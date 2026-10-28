import { describe, expect, it } from "vitest"

import {
	nextTransferListValueAfterAdd,
	nextTransferListValueAfterRemove,
	partitionTransferListOptions,
} from "@/frontend/components/TransferList/partitionTransferListOptions"

const data = [
	{ value: "engineering", label: "Engineering" },
	{ value: "product", label: "Product" },
	{ value: "marketing", label: "Marketing", disabled: true, disabledReason: "Used by Other" },
]

describe("partitionTransferListOptions", () => {
	it("puts selected values in chosen and the rest in choices", () => {
		const { available, selected } = partitionTransferListOptions(data, ["product"])

		expect(selected).toEqual([{ value: "product", label: "Product" }])
		expect(available.map((option) => option.value)).toEqual(["engineering", "marketing"])
	})

	it("deduplicates selected values before rendering chosen", () => {
		const { selected } = partitionTransferListOptions(
			data,
			["engineering", "product", "engineering"],
		)

		expect(selected.map((option) => option.value)).toEqual(["engineering", "product"])
	})
})

describe("nextTransferListValueAfterAdd", () => {
	it("appends a new choice", () => {
		expect(nextTransferListValueAfterAdd(["engineering"], "product", data))
			.toEqual(["engineering", "product"])
	})

	it("returns null for disabled or already chosen values", () => {
		expect(nextTransferListValueAfterAdd(["engineering"], "engineering", data)).toBeNull()
		expect(nextTransferListValueAfterAdd([], "marketing", data)).toBeNull()
	})

	it("collapses duplicates before appending", () => {
		expect(nextTransferListValueAfterAdd(
			["engineering", "engineering"],
			"product",
			data,
		)).toEqual(["engineering", "product"])
	})
})

describe("nextTransferListValueAfterRemove", () => {
	it("removes every occurrence of the value", () => {
		expect(nextTransferListValueAfterRemove(
			["engineering", "product", "engineering"],
			"engineering",
		)).toEqual(["product"])
	})
})
