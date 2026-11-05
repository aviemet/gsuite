import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { createElement, type ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { type DirectoryUser, emptyDirectoryProfile } from "@/shared/directoryFixtures"
import { type DirectoryUserUpdate } from "@/shared/directoryUpdate"

const getIdToken = vi.fn(async () => "test-token")
const currentUser = { getIdToken }

vi.mock("@/frontend/lib/firebase", () => ({
	getFirebaseAuth: () => ({ currentUser }),
}))

import { type DirectorySnapshot, fetchDirectory, useUpdateDirectoryUser } from "@/frontend/queries/directory"

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

function storedUser(): DirectoryUser {
	return {
		...emptyDirectoryProfile(),
		email: "jane.doe@example.com",
		displayName: "Jane Doe",
		givenName: "Jane",
		familyName: "Doe",
		signatureHtml: "",
		groupIds: [],
		organizationalUnitPaths: ["/"],
		jobTitle: "Product Manager",
	}
}

function jobTitleUpdate(jobTitle: string): DirectoryUserUpdate {
	return {
		email: "jane.doe@example.com",
		givenName: "Jane",
		familyName: "Doe",
		organizationalUnitPath: "/",
		jobTitle,
		department: "",
		organization: "",
		location: "",
		employeeId: "",
		address: "",
		costCenter: "",
		managerEmail: "",
		phoneNumbers: [],
		groupIds: [],
	}
}

describe("useUpdateDirectoryUser", () => {
	beforeEach(() => {
		getIdToken.mockClear()
		vi.stubGlobal("fetch", vi.fn())
	})

	it("shows the submitted job title while the save is in flight and keeps it if the listing is stale", async () => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
		})
		const current: DirectorySnapshot = {
			users: [storedUser()],
			groups: [],
			organizationalUnits: [],
		}
		queryClient.setQueryData(["directory"], current)
		let finishSave: (response: Response) => void = () => {}
		vi.mocked(fetch).mockReturnValue(new Promise((resolve) => {
			finishSave = resolve
		}))

		const { result } = renderHook(() => useUpdateDirectoryUser(), {
			wrapper: ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client: queryClient }, children),
		})

		result.current.mutate(jobTitleUpdate("Director"))

		await waitFor(() => {
			const shown = queryClient.getQueryData<DirectorySnapshot>(["directory"])
			expect(shown?.users[0]?.jobTitle).toBe("Director")
		})

		const stale: DirectorySnapshot = {
			...current,
			users: [{ ...storedUser(), jobTitle: "Product Manager" }],
		}
		finishSave({
			ok: true,
			json: async () => stale,
		} as Response)

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true)
		})
		expect(queryClient.getQueryData<DirectorySnapshot>(["directory"])?.users[0]?.jobTitle).toBe("Director")
	})

	it("restores the previous directory when the save fails", async () => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
		})
		queryClient.setQueryData(["directory"], {
			users: [storedUser()],
			groups: [],
			organizationalUnits: [],
		} satisfies DirectorySnapshot)
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			json: async () => ({ error: "Failed to update user" }),
		} as Response)

		const { result } = renderHook(() => useUpdateDirectoryUser(), {
			wrapper: ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client: queryClient }, children),
		})

		result.current.mutate(jobTitleUpdate("Director"))

		await waitFor(() => {
			expect(result.current.isError).toBe(true)
		})
		expect(queryClient.getQueryData<DirectorySnapshot>(["directory"])?.users[0]?.jobTitle).toBe("Product Manager")
	})
})
