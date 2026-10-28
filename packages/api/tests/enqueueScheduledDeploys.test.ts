import {
	assignmentTypes,
	CUSTOMERS_COLLECTION,
	directoryUsers,
	type SignatureUpdateMessage,
} from "@gsuite/shared"
import { describe, expect, it } from "vitest"

import { type DirectoryClient, type DirectorySnapshot } from "../src/directory/client"
import {
	enqueueScheduledDeploys,
	enqueueScheduledDeploysForCustomer,
} from "../src/enqueueScheduledDeploys"
import { type QueuePublisher } from "../src/queue/publisher"

interface QueryFilter {
	field: string
	value: unknown
}

function createFirestoreMock(seed?: {
	customers?: Record<string, Record<string, unknown>>
	templates?: Record<string, Record<string, unknown>>
	assignments?: Record<string, Record<string, unknown>>
}) {
	const customers = new Map<string, Record<string, unknown>>(
		Object.entries(seed?.customers ?? {}),
	)
	const templates = new Map<string, Record<string, unknown>>(
		Object.entries(seed?.templates ?? {}),
	)
	const assignments = new Map<string, Record<string, unknown>>(
		Object.entries(seed?.assignments ?? {}),
	)

	function collectionMap(collectionName: string) {
		if(collectionName === CUSTOMERS_COLLECTION) return customers
		if(collectionName === "templates") return templates
		return assignments
	}

	function matchingDocs(
		collectionName: string,
		filters: QueryFilter[],
	): Array<{ id: string, data: Record<string, unknown> }> {
		return [...collectionMap(collectionName).entries()]
			.filter(([, data]) => filters.every((filter) => data[filter.field] === filter.value))
			.map(([id, data]) => ({ id, data }))
	}

	function createQuery(collectionName: string, filters: QueryFilter[] = []) {
		return {
			where(field: string, _operator: string, value: unknown) {
				return createQuery(collectionName, [...filters, { field, value }])
			},
			async get() {
				const docs = matchingDocs(collectionName, filters).map(({ id, data }) => ({
					id,
					data: () => data,
				}))
				return { docs }
			},
		}
	}

	return {
		db: {
			collection(name: string) {
				return {
					doc(id: string) {
						return {
							id,
							async get() {
								const data = collectionMap(name).get(id)
								return {
									exists: Boolean(data),
									id,
									data: () => data,
								}
							},
						}
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

function createQueue(): QueuePublisher & { published: SignatureUpdateMessage[] } {
	const published: SignatureUpdateMessage[] = []
	return {
		published,
		async publishSignatureUpdate(message) {
			published.push(message)
		},
	}
}

function directoryWith(users = directoryUsers): DirectoryClient {
	const snapshot: DirectorySnapshot = {
		users,
		groups: [],
		organizationalUnits: [],
	}
	return {
		async listDirectory() {
			return snapshot
		},
		async getUser() {
			return undefined
		},
		async checkUsers() {},
		async checkGroups() {},
		async checkOrganizationalUnits() {},
	}
}

const customer = {
	id: "customer-1",
	primaryDomain: "example.com",
	workspaceAdminEmail: "jane.doe@example.com",
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
}

describe("enqueueScheduledDeploysForCustomer", () => {
	it("publishes nothing when no templates are scheduled", async () => {
		const firestore = createFirestoreMock({
			templates: {
				"template-1": {
					customerId: customer.id,
					isDefault: true,
					isActive: true,
					isScheduled: false,
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
			},
		})
		const queue = createQueue()

		const result = await enqueueScheduledDeploysForCustomer(customer, {
			db: firestore.db as never,
			queue,
			createDirectory: () => directoryWith(),
			createId: () => "deploy-1",
		})

		expect(result).toEqual({ customerId: customer.id, queuedUserCount: 0 })
		expect(queue.published).toEqual([])
	})

	it("enqueues users whose winning template is scheduled", async () => {
		const firestore = createFirestoreMock({
			templates: {
				"default-scheduled": {
					customerId: customer.id,
					isDefault: true,
					isActive: true,
					isScheduled: true,
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
				"person-unscheduled": {
					customerId: customer.id,
					isDefault: false,
					isActive: true,
					isScheduled: false,
					updatedAt: "2026-01-02T00:00:00.000Z",
				},
			},
			assignments: {
				"assignment-1": {
					customerId: customer.id,
					templateId: "person-unscheduled",
					assignmentType: assignmentTypes.user,
					targetId: "jane.doe@example.com",
					isActive: true,
				},
			},
		})
		const queue = createQueue()

		const result = await enqueueScheduledDeploysForCustomer(customer, {
			db: firestore.db as never,
			queue,
			createDirectory: () => directoryWith(),
			createId: () => "deploy-1",
		})

		expect(result.queuedUserCount).toBe(3)
		expect(queue.published).toHaveLength(1)
		expect(queue.published[0]).toEqual({
			deployId: "deploy-1",
			templateId: "default-scheduled",
			customerId: customer.id,
			userEmails: [
				"alex.kim@example.com",
				"morgan.patel@example.com",
				"sam.lee@example.com",
			],
		})
	})

	it("skips inactive scheduled templates", async () => {
		const firestore = createFirestoreMock({
			templates: {
				"inactive-scheduled": {
					customerId: customer.id,
					isDefault: true,
					isActive: false,
					isScheduled: true,
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
			},
		})
		const queue = createQueue()

		const result = await enqueueScheduledDeploysForCustomer(customer, {
			db: firestore.db as never,
			queue,
			createDirectory: () => directoryWith(),
			createId: () => "deploy-1",
		})

		expect(result.queuedUserCount).toBe(0)
		expect(queue.published).toEqual([])
	})
})

describe("enqueueScheduledDeploys", () => {
	it("processes each customer and continues after failures", async () => {
		const firestore = createFirestoreMock({
			customers: {
				"customer-ok": {
					primaryDomain: "example.com",
					workspaceAdminEmail: "jane.doe@example.com",
					createdAt: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
				"customer-bad": {
					primaryDomain: "broken.com",
					workspaceAdminEmail: "admin@broken.com",
					createdAt: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
			},
			templates: {
				"template-ok": {
					customerId: "customer-ok",
					isDefault: true,
					isActive: true,
					isScheduled: true,
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
				"template-bad": {
					customerId: "customer-bad",
					isDefault: true,
					isActive: true,
					isScheduled: true,
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
			},
		})
		const queue = createQueue()
		let deployCount = 0

		const result = await enqueueScheduledDeploys({
			db: firestore.db as never,
			queue,
			createDirectory: (subjectEmail) => {
				if(subjectEmail === "admin@broken.com") {
					return {
						async listDirectory() {
							throw new Error("Directory unavailable")
						},
						async getUser() {
							return undefined
						},
						async checkUsers() {},
						async checkGroups() {},
						async checkOrganizationalUnits() {},
					}
				}
				return directoryWith()
			},
			createId: () => `deploy-${++deployCount}`,
		})

		expect(result.queuedUserCount).toBe(directoryUsers.length)
		expect(result.customers).toEqual([
			{ customerId: "customer-ok", queuedUserCount: directoryUsers.length },
			{
				customerId: "customer-bad",
				queuedUserCount: 0,
				error: "Directory unavailable",
			},
		])
		expect(queue.published).toHaveLength(1)
		expect(queue.published[0]?.customerId).toBe("customer-ok")
	})
})
