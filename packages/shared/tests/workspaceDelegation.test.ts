import { describe, expect, it } from "vitest"

import {
	isWorkspaceDelegationUnauthorizedMessage,
	WORKSPACE_DELEGATION_UNAUTHORIZED_MESSAGE,
	workspaceScopesForAdminConsole,
} from "../src/workspace"

describe("workspaceScopesForAdminConsole", () => {
	it("joins scopes the way Google Admin expects", () => {
		expect(workspaceScopesForAdminConsole([
			"https://www.googleapis.com/auth/admin.directory.user.readonly",
			"https://www.googleapis.com/auth/gmail.settings.basic",
		])).toBe(
			"https://www.googleapis.com/auth/admin.directory.user.readonly,https://www.googleapis.com/auth/gmail.settings.basic",
		)
	})
})

describe("isWorkspaceDelegationUnauthorizedMessage", () => {
	it("recognizes the canonical connect failure", () => {
		expect(isWorkspaceDelegationUnauthorizedMessage(WORKSPACE_DELEGATION_UNAUTHORIZED_MESSAGE)).toBe(true)
	})

	it("recognizes the older toast wording", () => {
		expect(isWorkspaceDelegationUnauthorizedMessage(
			"Domain-wide delegation is not authorized for this user",
		)).toBe(true)
	})
})
