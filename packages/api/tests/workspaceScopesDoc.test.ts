import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { workspaceScopes } from "@gsuite/shared"
import { describe, expect, it } from "vitest"

const setupDoc = readFileSync(
	resolve(dirname(fileURLToPath(import.meta.url)), "../../../docs/google-workspace-setup.mdx"),
	"utf8",
)

describe("workspace scope documentation", () => {
	it("lists every scope the app requests and the re-grant steps", () => {
		for(const scope of workspaceScopes) {
			expect(setupDoc).toContain(scope)
		}
		expect(setupDoc).not.toContain("https://www.googleapis.com/auth/admin.directory.orgunit.readonly")
		expect(setupDoc).toContain("Google Auth Platform → Data Access")
		expect(setupDoc).toContain("Manage Domain Wide Delegation")
		expect(setupDoc).toContain(workspaceScopes.join(","))
	})
})
