import { beforeEach, describe, expect, it, vi } from "vitest"

const getIdToken = vi.fn(async () => "test-token")
const currentUser = { getIdToken }

vi.mock("@/frontend/lib/firebase", () => ({
	getFirebaseAuth: () => ({ currentUser }),
}))

import { deploySignatureTemplate } from "@/frontend/features/signatures/deploySignatureTemplate"

describe("deploySignatureTemplate", () => {
	beforeEach(() => {
		getIdToken.mockClear()
		vi.stubGlobal("fetch", vi.fn())
	})

	it("posts the template id with the Firebase ID token", async () => {
		const fetchMock = vi.mocked(fetch)
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ templateId: "template-1", queuedUserCount: 3 }),
		} as Response)

		const result = await deploySignatureTemplate("template-1")

		expect(getIdToken).toHaveBeenCalledOnce()
		expect(fetchMock).toHaveBeenCalledOnce()
		const [url, init] = fetchMock.mock.calls[0] ?? []
		expect(url).toBe("/api/deploy-template")
		expect(init?.method).toBe("POST")
		expect(init?.body).toBe(JSON.stringify({ templateId: "template-1" }))
		expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer test-token")
		expect(result).toEqual({ templateId: "template-1", queuedUserCount: 3 })
	})

	it("throws when the API returns an error", async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			json: async () => ({ error: "Template not found" }),
		} as Response)

		await expect(deploySignatureTemplate("missing")).rejects.toThrow("Template not found")
	})
})
