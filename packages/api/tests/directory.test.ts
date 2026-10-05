import {
	directoryGroups,
	directoryOrganizationalUnits,
	directoryUsers,
} from "@gsuite/shared"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../src/workspace/authorize", () => ({
	authorizeMember: vi.fn(async (authorizationHeader: string | undefined) => {
		if(authorizationHeader !== "Bearer admin-token") {
			throw new Error("Missing bearer token")
		}
		return {
			uid: "admin-1",
			email: "admin@example.com",
			customerId: "customer-1",
			role: "owner",
			primaryDomain: "example.com",
			workspaceAdminEmail: "jane.doe@example.com",
		}
	}),
}))

import { directoryHandler } from "../src/directoryHandler"

describe("directoryHandler", () => {
	beforeEach(() => {
		process.env.DIRECTORY_MODE = "mock"
	})

	it("returns the mock Workspace directory for an admin", async () => {
		const result = await directoryHandler({
			method: "GET",
			authorizationHeader: "Bearer admin-token",
			body: {},
		})
		expect(result.status).toBe(200)
		expect(result.payload).toEqual({
			users: directoryUsers,
			groups: directoryGroups,
			organizationalUnits: directoryOrganizationalUnits,
		})
	})

	it("rejects missing auth", async () => {
		await expect(directoryHandler({
			method: "GET",
			authorizationHeader: undefined,
			body: {},
		})).rejects.toThrow("Missing bearer token")
	})
})
