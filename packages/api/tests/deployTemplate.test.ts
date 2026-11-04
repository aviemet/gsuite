import {
	assignmentTypes,
	directoryUsers,
	type SignatureUpdateMessage,
} from "@gsuite/shared"
import { describe, expect, it } from "vitest"

import { deployTemplate } from "../src/signatures/deployTemplate"

interface QueryFilter {
	field: string
	value: unknown
}

function createFirestoreMock(seed?: {
	templates?: Record<string, Record<string, unknown>>
	assignments?: Record<string, Record<string, unknown>>
}) {
	const templates = new Map<string, Record<string, unknown>>(
		Object.entries(seed?.templates ?? {}),
	)
	const assignments = new Map<string, Record<string, unknown>>(
		Object.entries(seed?.assignments ?? {}),
	)

	function matchingDocs(
		collectionName: string,
		filters: QueryFilter[],
	): Array<{ id: string, data: Record<string, unknown> }> {
		const source = collectionName === "templates" ? templates : assignments
		return [...source.entries()]
			.filter(([, data]) => filters.every((filter) => data[filter.field] === filter.value))
			.map(([id, data]) => ({ id, data }))
	}

	function createDocRef(collectionName: string, id: string) {
		return {
			id,
			async get() {
				const data = collectionName === "templates"
					? templates.get(id)
					: assignments.get(id)
				return {
					exists: Boolean(data),
					data: () => data,
				}
			},
		}
	}

	function createQuery(collectionName: string, filters: QueryFilter[] = []) {
		return {
			where(field: string, _operator: string, value: unknown) {
				return createQuery(collectionName, [...filters, { field, value }])
			},
			async get() {
				const docs = matchingDocs(collectionName, filters).map(({ id, data }) => ({
					id,
					ref: createDocRef(collectionName, id),
					data: () => data,
				}))
				return { docs }
			},
		}
	}

	return {
		templates,
		assignments,
		db: {
			collection(name: string) {
				return {
					doc(id: string) {
						return createDocRef(name, id)
					},
					where(field: string, _operator: string, value: unknown) {
						return createQuery(name, [{ field, value }])
					},
					async get() {
						return createQuery(name).get()
					},
				}
			},
		},
	}
}

describe("deployTemplate", () => {
	it("queues deploy for users who currently resolve to the template", async () => {
		const firestore = createFirestoreMock({
			templates: {
				"template-1": {
					id: "template-1",
					customerId: "customer-1",
					isDefault: false,
					isActive: true,
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
			},
			assignments: {
				"assignment-1": {
					id: "assignment-1",
					templateId: "template-1",
					assignmentType: assignmentTypes.group,
					targetId: "engineering",
					customerId: "customer-1",
					isActive: true,
				},
			},
		})
		const published: SignatureUpdateMessage[] = []

		const result = await deployTemplate(
			"template-1",
			{ uid: "admin-1", customerId: "customer-1" },
			{
				db: firestore.db as never,
				queue: {
					async publishSignatureUpdate(message) {
						published.push(message)
					},
				},
				users: directoryUsers,
				createId: () => "deploy-1",
			},
		)

		expect(result).toEqual({ templateId: "template-1", queuedUserCount: 2 })
		expect(published).toEqual([{
			deployId: "deploy-1",
			templateId: "template-1",
			customerId: "customer-1",
			userEmails: ["alex.kim@example.com", "jane.doe@example.com"],
		}])
	})

	it("returns zero without publishing when no users resolve to the template", async () => {
		const firestore = createFirestoreMock({
			templates: {
				"template-1": {
					id: "template-1",
					customerId: "customer-1",
					isDefault: false,
					isActive: true,
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
			},
			assignments: {},
		})
		const published: SignatureUpdateMessage[] = []

		const result = await deployTemplate(
			"template-1",
			{ uid: "admin-1", customerId: "customer-1" },
			{
				db: firestore.db as never,
				queue: {
					async publishSignatureUpdate(message) {
						published.push(message)
					},
				},
				users: directoryUsers,
			},
		)

		expect(result).toEqual({ templateId: "template-1", queuedUserCount: 0 })
		expect(published).toHaveLength(0)
	})

	it("rejects templates from another customer", async () => {
		const firestore = createFirestoreMock({
			templates: {
				"template-1": {
					id: "template-1",
					customerId: "other-customer",
					isDefault: false,
					isActive: true,
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
			},
		})

		await expect(deployTemplate(
			"template-1",
			{ uid: "admin-1", customerId: "customer-1" },
			{
				db: firestore.db as never,
				queue: { async publishSignatureUpdate() {} },
				users: directoryUsers,
			},
		)).rejects.toMatchObject({ message: "Template belongs to another customer", status: 403 })
	})

	it("rejects missing templates", async () => {
		const firestore = createFirestoreMock()

		await expect(deployTemplate(
			"missing",
			{ uid: "admin-1", customerId: "customer-1" },
			{
				db: firestore.db as never,
				queue: { async publishSignatureUpdate() {} },
				users: directoryUsers,
			},
		)).rejects.toMatchObject({ message: "Template not found", status: 404 })
	})
})
