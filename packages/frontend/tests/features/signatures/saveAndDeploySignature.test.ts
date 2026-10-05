import { beforeEach, describe, expect, it, vi } from "vitest"

const getIdToken = vi.fn(async () => "test-token")
const currentUser = { getIdToken }

vi.mock("@/frontend/lib/firebase", () => ({
	getFirebaseAuth: () => ({ currentUser }),
}))

import { saveAndDeploySignature } from "@/frontend/features/signatures/saveAndDeploySignature"

describe("saveAndDeploySignature", () => {
	beforeEach(() => {
		getIdToken.mockClear()
		vi.stubGlobal("fetch", vi.fn())
	})

	it("posts wizard values with the Firebase ID token", async () => {
		const fetchMock = vi.mocked(fetch)
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ templateId: "template-1", queuedUserCount: 2 }),
		} as Response)

		const result = await saveAndDeploySignature({
			setupSource: "blank",
			sourceTemplateId: null,
			sourceAccountEmail: null,
			name: "Standard",
			content: "<p>{{fullName}}</p>",
			isDefault: false,
			userEmails: ["jane.doe@example.com"],
			groupIds: ["engineering"],
			organizationalUnitPaths: [],
			isScheduled: false,
		}, "template-1")

		expect(getIdToken).toHaveBeenCalledOnce()
		expect(fetchMock).toHaveBeenCalledOnce()
		const [url, init] = fetchMock.mock.calls[0] ?? []
		expect(url).toBe("/api/save-and-deploy")
		expect(init?.method).toBe("POST")
		expect(init?.body).toBe(JSON.stringify({
			templateId: "template-1",
			name: "Standard",
			content: "<p>{{fullName}}</p>",
			isDefault: false,
			userEmails: ["jane.doe@example.com"],
			groupIds: ["engineering"],
			organizationalUnitPaths: [],
			isScheduled: false,
		}))
		expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer test-token")
		expect(result).toEqual({ templateId: "template-1", queuedUserCount: 2 })
	})

	it("throws when the API returns an error", async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			json: async () => ({ error: "Admin access required" }),
		} as Response)

		await expect(saveAndDeploySignature({
			setupSource: "blank",
			sourceTemplateId: null,
			sourceAccountEmail: null,
			name: "Standard",
			content: "<p>x</p>",
			isDefault: false,
			userEmails: [],
			groupIds: ["engineering"],
			organizationalUnitPaths: [],
			isScheduled: false,
		})).rejects.toThrow("Admin access required")
	})
})
