import { describe, expect, it } from "vitest"

import { formatTemplateCreatedAt } from "@/frontend/features/signatures/SignaturesTable/formatTemplateCreatedAt"

describe("formatTemplateCreatedAt", () => {
	it("formats an ISO createdAt string for display", () => {
		expect(formatTemplateCreatedAt("2026-03-15T12:00:00.000Z")).toMatch(/Mar/)
		expect(formatTemplateCreatedAt("2026-03-15T12:00:00.000Z")).toMatch(/15/)
		expect(formatTemplateCreatedAt("2026-03-15T12:00:00.000Z")).toMatch(/2026/)
	})
})
