import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"

import { templateQueryKey } from "@/frontend/queries/templates"

describe("templateQueryKey", () => {
	it("is invalidated together with the template list after a save", async () => {
		const queryClient = new QueryClient()
		queryClient.setQueryData(templateQueryKey("template-1"), { id: "template-1", content: "before save" })

		await queryClient.invalidateQueries({ queryKey: ["templates"] })

		expect(queryClient.getQueryState(templateQueryKey("template-1"))?.isInvalidated).toBe(true)
	})
})
