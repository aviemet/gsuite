import { describe, expect, it } from "vitest"

import {
	isWorkspaceNotInstalledMessage,
	WORKSPACE_NOT_INSTALLED_MESSAGE,
} from "../src/workspace"

describe("isWorkspaceNotInstalledMessage", () => {
	it("recognizes the canonical connect failure", () => {
		expect(isWorkspaceNotInstalledMessage(WORKSPACE_NOT_INSTALLED_MESSAGE)).toBe(true)
	})

	it("recognizes a Marketplace install-pending phrasing", () => {
		expect(isWorkspaceNotInstalledMessage(
			"Install it from the Google Workspace Marketplace first",
		)).toBe(true)
	})

	it("recognizes the older toast wording", () => {
		expect(isWorkspaceNotInstalledMessage(
			"Domain-wide delegation is not authorized for this user",
		)).toBe(true)
	})
})
