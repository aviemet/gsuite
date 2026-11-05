import { beforeEach, describe, expect, it, vi } from "vitest"

const currentRole = vi.hoisted(() => ({ role: "viewer" }))

vi.mock("../src/workspace/authorize", async () => {
	const actual = await vi.importActual<typeof import("../src/workspace/authorize")>(
		"../src/workspace/authorize",
	)
	return {
		...actual,
		authorizeMember: vi.fn(async (authorizationHeader: string | undefined) => {
			if(authorizationHeader !== "Bearer token") {
				throw new Error("Missing bearer token")
			}
			return {
				uid: "user-1",
				email: "person@example.com",
				customerId: "customer-1",
				role: currentRole.role,
				primaryDomain: "example.com",
				workspaceAdminEmail: "jane.doe@example.com",
			}
		}),
	}
})

import { updateDirectoryUserHandler } from "../src/directory/handler"
import { resetSharedMockDirectoryClient } from "../src/directory/mockClient"

describe("updateDirectoryUserHandler", () => {
	beforeEach(() => {
		process.env.DIRECTORY_MODE = "mock"
		resetSharedMockDirectoryClient()
		currentRole.role = "viewer"
	})

	it("rejects viewers", async () => {
		await expect(updateDirectoryUserHandler({
			method: "POST",
			authorizationHeader: "Bearer token",
			body: { email: "jane.doe@example.com" },
		})).rejects.toThrow("Admin access required")
	})

	it("updates a user for an admin", async () => {
		currentRole.role = "admin"
		const result = await updateDirectoryUserHandler({
			method: "POST",
			authorizationHeader: "Bearer token",
			body: {
				email: "jane.doe@example.com",
				givenName: "Janet",
				familyName: "Doe",
				organizationalUnitPath: "/Product",
				jobTitle: "Director",
				groupIds: ["product"],
			},
		})
		expect(result.status).toBe(200)
		const payload = result.payload
		if(!payload || typeof payload !== "object" || !("users" in payload)) {
			throw new Error("Expected a directory snapshot")
		}
		const users = Reflect.get(payload, "users")
		if(!Array.isArray(users)) throw new Error("Expected users")
		const jane = users.find((user) => {
			return user && typeof user === "object" && Reflect.get(user, "email") === "jane.doe@example.com"
		})
		expect(jane && typeof jane === "object" ? Reflect.get(jane, "jobTitle") : undefined).toBe("Director")
	})
})
