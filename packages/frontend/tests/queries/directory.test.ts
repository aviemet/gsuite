import { beforeEach, describe, expect, it, vi } from "vitest"

const getIdToken = vi.fn(async () => "test-token")
const currentUser = { getIdToken }

vi.mock("@/frontend/lib/firebase", () => ({
	getFirebaseAuth: () => ({ currentUser }),
}))

import { fetchDirectory } from "@/frontend/queries/directory"

describe("fetchDirectory", () => {
	beforeEach(() => {
		getIdToken.mockClear()
		vi.stubGlobal("fetch", vi.fn())
	})

	it("loads directory with the Firebase ID token", async () => {
		const snapshot = {
			users: [{
				email: "jane.doe@example.com",
				displayName: "Jane Doe",
				signatureHtml: "",
				groupIds: [],
				organizationalUnitPaths: [],
			}],
			groups: [{ id: "engineering", name: "Engineering", email: "engineering@example.com" }],
			organizationalUnits: [{ path: "/", name: "Example Corp" }],
		}
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: async () => snapshot,
		} as Response)

		const result = await fetchDirectory()
		expect(getIdToken).toHaveBeenCalledOnce()
		const [url, init] = vi.mocked(fetch).mock.calls[0] ?? []
		expect(url).toBe("/api/directory")
		expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer test-token")
		expect(result).toEqual(snapshot)
	})
})
