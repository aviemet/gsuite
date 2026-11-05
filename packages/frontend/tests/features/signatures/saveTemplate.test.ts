import { beforeEach, describe, expect, it, vi } from "vitest"

const getIdToken = vi.fn(async () => "test-token")
const currentUser = { getIdToken }

vi.mock("@/frontend/lib/firebase", () => ({
	getFirebaseAuth: () => ({ currentUser }),
}))

import { saveTemplate } from "@/frontend/features/signatures/saveTemplate"

describe("saveTemplate", () => {
	beforeEach(() => {
		getIdToken.mockClear()
		vi.stubGlobal("fetch", vi.fn())
	})

	it("posts the name and content", async () => {
		const fetchMock = vi.mocked(fetch)
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ templateId: "template-1" }),
		} as Response)

		const result = await saveTemplate({
			templateId: "template-1",
			name: "Standard",
			content: "<p>{{fullName}}</p>",
		})

		expect(fetchMock).toHaveBeenCalledOnce()
		const [url, init] = fetchMock.mock.calls[0] ?? []
		expect(url).toBe("/api/templates")
		expect(init?.method).toBe("POST")
		expect(init?.body).toBe(JSON.stringify({
			templateId: "template-1",
			name: "Standard",
			content: "<p>{{fullName}}</p>",
		}))
		expect(result).toEqual({ templateId: "template-1" })
	})

	it("throws when the API returns an error", async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			json: async () => ({ error: "Name is required" }),
		} as Response)

		await expect(saveTemplate({
			name: "",
			content: "<p>x</p>",
		})).rejects.toThrow("Name is required")
	})
})
