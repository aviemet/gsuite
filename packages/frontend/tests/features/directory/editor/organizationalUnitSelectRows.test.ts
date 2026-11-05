import { describe, expect, it } from "vitest"

import { organizationalUnitSelectRows } from "@/frontend/features/directory/editor/organizationalUnitSelectRows"

describe("organizationalUnitSelectRows", () => {
	it("lists parents before children with depth and child markers", () => {
		expect(organizationalUnitSelectRows([
			{ path: "/Sales/West", name: "West" },
			{ path: "/Engineering", name: "Engineering" },
			{ path: "/", name: "Example Corp" },
			{ path: "/Marketing", name: "Marketing" },
			{ path: "/Engineering/Platform", name: "Platform" },
			{ path: "/Sales", name: "Sales" },
		])).toEqual([
			{ path: "/", name: "Example Corp", depth: 0, hasChildren: true },
			{ path: "/Engineering", name: "Engineering", depth: 1, hasChildren: true },
			{ path: "/Engineering/Platform", name: "Platform", depth: 2, hasChildren: false },
			{ path: "/Marketing", name: "Marketing", depth: 1, hasChildren: false },
			{ path: "/Sales", name: "Sales", depth: 1, hasChildren: true },
			{ path: "/Sales/West", name: "West", depth: 2, hasChildren: false },
		])
	})
})
