import { describe, expect, it } from "vitest"

import { readFirebaseProjectId, resolveFirestoreDatabaseId } from "../src/firebaseProject"

describe("readFirebaseProjectId", () => {
	it("prefers the process project id over the client config", () => {
		expect(readFirebaseProjectId({
			GCLOUD_PROJECT: "from-platform",
			FIREBASE_PROJECT_ID: "from-firebase",
			VITE_FIREBASE_PROJECT_ID: "from-vite",
		})).toBe("from-platform")
	})

	it("uses the client project id when the server variables are unset", () => {
		expect(readFirebaseProjectId({
			VITE_FIREBASE_PROJECT_ID: "from-vite",
		})).toBe("from-vite")
	})

	it("uses the console database id outside the emulator", () => {
		expect(resolveFirestoreDatabaseId(false)).toBe("default")
	})

	it("uses the emulator database id locally", () => {
		expect(resolveFirestoreDatabaseId(true)).toBe("(default)")
	})

	it("throws when no project id is configured", () => {
		expect(() => readFirebaseProjectId({})).toThrow("Missing Firebase project id")
	})
})
