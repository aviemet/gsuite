import { describe, expect, it } from "vitest"

import { sortSignatureTemplates } from "@/frontend/features/signatures/SignaturesTable/sortSignatureTemplates"
import { type Template } from "@/frontend/types/firebase"

function template(partial: Pick<Template, "id" | "name" | "isScheduled" | "createdAt">): Template {
	return {
		content: "",
		variables: [],
		conditions: [],
		createdBy: "admin",
		updatedAt: "2026-01-01T00:00:00.000Z",
		isActive: true,
		customerId: "customer-1",
		createdAt: "2026-01-01T00:00:00.000Z",
		...partial,
	}
}

const alpha = template({ id: "a", name: "Alpha", isScheduled: false, createdAt: "2026-03-01T00:00:00.000Z" })
const bravo = template({ id: "b", name: "Bravo", isScheduled: true, createdAt: "2026-01-01T00:00:00.000Z" })
const charlie = template({ id: "c", name: "Charlie", isScheduled: false, createdAt: "2026-02-01T00:00:00.000Z" })

describe("sortSignatureTemplates", () => {
	it("sorts by name ascending and descending", () => {
		expect(sortSignatureTemplates([charlie, alpha, bravo], {
			columnAccessor: "name",
			direction: "asc",
		}).map((row) => row.id)).toEqual(["a", "b", "c"])

		expect(sortSignatureTemplates([alpha, bravo, charlie], {
			columnAccessor: "name",
			direction: "desc",
		}).map((row) => row.id)).toEqual(["c", "b", "a"])
	})

	it("sorts by schedule so scheduled templates come last when ascending", () => {
		expect(sortSignatureTemplates([bravo, alpha, charlie], {
			columnAccessor: "isScheduled",
			direction: "asc",
		}).map((row) => row.id)).toEqual(["a", "c", "b"])

		expect(sortSignatureTemplates([alpha, charlie, bravo], {
			columnAccessor: "isScheduled",
			direction: "desc",
		}).map((row) => row.id)).toEqual(["b", "a", "c"])
	})

	it("sorts by createdAt ascending and descending", () => {
		expect(sortSignatureTemplates([alpha, charlie, bravo], {
			columnAccessor: "createdAt",
			direction: "asc",
		}).map((row) => row.id)).toEqual(["b", "c", "a"])

		expect(sortSignatureTemplates([bravo, charlie, alpha], {
			columnAccessor: "createdAt",
			direction: "desc",
		}).map((row) => row.id)).toEqual(["a", "c", "b"])
	})
})
