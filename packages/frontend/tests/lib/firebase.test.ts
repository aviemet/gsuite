import { beforeEach, describe, expect, it, vi } from "vitest"

const {
	connectAuthEmulator,
	connectFirestoreEmulator,
	getApps,
	getAuth,
	getFirestore,
	initializeApp,
} = vi.hoisted(() => ({
	connectAuthEmulator: vi.fn(),
	connectFirestoreEmulator: vi.fn(),
	getApps: vi.fn(() => []),
	getAuth: vi.fn(() => ({ name: "auth" })),
	getFirestore: vi.fn(() => ({ name: "firestore" })),
	initializeApp: vi.fn(() => ({ name: "app" })),
}))

vi.mock("firebase/app", () => ({
	getApps,
	initializeApp,
}))

vi.mock("firebase/auth", () => ({
	connectAuthEmulator,
	getAuth,
}))

vi.mock("firebase/firestore", () => ({
	connectFirestoreEmulator,
	getFirestore,
}))

describe("initializeFirebase", () => {
	beforeEach(() => {
		vi.resetModules()
		connectAuthEmulator.mockClear()
		connectFirestoreEmulator.mockClear()
		getApps.mockClear()
		getAuth.mockClear()
		getFirestore.mockClear()
		initializeApp.mockClear()
	})

	it("connects the auth emulator without the warning banner", async () => {
		const { initializeFirebase } = await import("@/frontend/lib/firebase")

		initializeFirebase()

		expect(connectAuthEmulator).toHaveBeenCalledWith(
			{ name: "auth" },
			"http://localhost:9099",
			{ disableWarnings: true },
		)
	})
})
