import { describe, expect, it } from "vitest"

import {
	isSettingsPath,
	settingsPathWhenUnconnected,
} from "@/frontend/components/RequireWorkspaceConnection"

describe("settingsPathWhenUnconnected", () => {
	it("returns null while signed out", () => {
		expect(settingsPathWhenUnconnected("/", false, true, false)).toBeNull()
	})

	it("returns null while membership is unresolved", () => {
		expect(settingsPathWhenUnconnected("/", false, false, true)).toBeNull()
	})

	it("returns null when the user already has a membership", () => {
		expect(settingsPathWhenUnconnected("/", true, true, true)).toBeNull()
		expect(settingsPathWhenUnconnected("/signatures", true, true, true)).toBeNull()
	})

	it("keeps settings reachable without a membership", () => {
		expect(settingsPathWhenUnconnected("/settings", false, true, true)).toBeNull()
	})

	it("sends unconnected users to settings", () => {
		expect(settingsPathWhenUnconnected("/", false, true, true)).toBe("/settings")
		expect(settingsPathWhenUnconnected("/signatures", false, true, true)).toBe("/settings")
		expect(settingsPathWhenUnconnected("/signatures/edit", false, true, true)).toBe("/settings")
	})
})

describe("isSettingsPath", () => {
	it("recognizes settings routes", () => {
		expect(isSettingsPath("/settings")).toBe(true)
		expect(isSettingsPath("/settings/")).toBe(true)
		expect(isSettingsPath("/")).toBe(false)
		expect(isSettingsPath("/signatures")).toBe(false)
	})
})
