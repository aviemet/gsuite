import { describe, expect, it } from "vitest"

import {
	isSettingsPath,
	settingsPathWhenUnconnected,
} from "@/frontend/components/RequireWorkspaceConnection"

describe("settingsPathWhenUnconnected", () => {
	it("returns null while signed out", () => {
		expect(settingsPathWhenUnconnected("/admin", false, true, false)).toBeNull()
	})

	it("returns null while membership is unresolved", () => {
		expect(settingsPathWhenUnconnected("/admin", false, false, true)).toBeNull()
	})

	it("returns null when the user already has a membership", () => {
		expect(settingsPathWhenUnconnected("/admin", true, true, true)).toBeNull()
		expect(settingsPathWhenUnconnected("/admin/signatures", true, true, true)).toBeNull()
	})

	it("keeps settings reachable without a membership", () => {
		expect(settingsPathWhenUnconnected("/admin/settings", false, true, true)).toBeNull()
	})

	it("sends unconnected users to settings", () => {
		expect(settingsPathWhenUnconnected("/admin", false, true, true)).toBe("/admin/settings")
		expect(settingsPathWhenUnconnected("/admin/signatures", false, true, true)).toBe("/admin/settings")
		expect(settingsPathWhenUnconnected("/admin/signatures/edit", false, true, true)).toBe("/admin/settings")
	})
})

describe("isSettingsPath", () => {
	it("recognizes settings routes", () => {
		expect(isSettingsPath("/admin/settings")).toBe(true)
		expect(isSettingsPath("/admin/settings/")).toBe(true)
		expect(isSettingsPath("/admin")).toBe(false)
		expect(isSettingsPath("/admin/signatures")).toBe(false)
	})
})
