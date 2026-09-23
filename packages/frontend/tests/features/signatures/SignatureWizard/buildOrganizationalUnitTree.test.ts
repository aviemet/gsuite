import { describe, expect, it } from "vitest"

import { buildOrganizationalUnitTree } from "@/frontend/features/signatures/SignatureWizard/buildOrganizationalUnitTree"

describe("buildOrganizationalUnitTree", () => {
	it("nests units by path under their parents", () => {
		const tree = buildOrganizationalUnitTree([
			{ path: "/", name: "Example Corp" },
			{ path: "/Engineering", name: "Engineering" },
			{ path: "/Engineering/Platform", name: "Platform" },
			{ path: "/Sales", name: "Sales" },
			{ path: "/Sales/West", name: "West" },
			{ path: "/Marketing", name: "Marketing" },
		])

		expect(tree).toEqual([
			{
				value: "/",
				label: "Example Corp",
				children: [
					{
						value: "/Engineering",
						label: "Engineering",
						children: [
							{ value: "/Engineering/Platform", label: "Platform" },
						],
					},
					{ value: "/Marketing", label: "Marketing" },
					{
						value: "/Sales",
						label: "Sales",
						children: [
							{ value: "/Sales/West", label: "West" },
						],
					},
				],
			},
		])
	})

	it("promotes orphaned paths to roots when a parent is missing", () => {
		const tree = buildOrganizationalUnitTree([
			{ path: "/Engineering/Platform", name: "Platform" },
			{ path: "/Sales", name: "Sales" },
		])

		expect(tree).toEqual([
			{ value: "/Sales", label: "Sales" },
			{ value: "/Engineering/Platform", label: "Platform" },
		])
	})
})
