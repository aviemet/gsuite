import { describe, expect, it } from "vitest"

import { assignedGroupsForSave } from "../src/signatures/assignedGroupsForSave"

describe("assignedGroupsForSave", () => {
	it("reads one group when the assignment names a single group", async () => {
		const calls: string[] = []
		const groups = await assignedGroupsForSave({
			async getGroup(groupId) {
				calls.push(groupId)
				return {
					id: groupId,
					name: "Engineering",
					email: "engineering@example.com",
					description: "",
					members: [],
				}
			},
		}, ["engineering"])
		expect(calls).toEqual(["engineering"])
		expect(groups.map((group) => group.name)).toEqual(["Engineering"])
	})

	it("does not call Directory when the assignment does not name exactly one group", async () => {
		const calls: string[] = []
		const directory = {
			async getGroup(groupId: string) {
				calls.push(groupId)
				return undefined
			},
		}
		expect(await assignedGroupsForSave(directory, [])).toEqual([])
		expect(await assignedGroupsForSave(directory, ["engineering", "sales"])).toEqual([])
		expect(calls).toEqual([])
	})
})
