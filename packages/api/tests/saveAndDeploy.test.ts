import {
	assignmentTypes,
	directoryGroups,
	directoryUsers,
	type SaveAndDeployRequest,
	SIGNATURE_DEPLOY_LOGS_COLLECTION,
	type SignatureDeployLog,
	type SignatureUpdateMessage,
} from "@gsuite/shared"
import { describe, expect, it, vi } from "vitest"

import { type GmailClient, type SignatureUpdate } from "../src/gmail/client"
import { MockGmailClient } from "../src/gmail/mockClient"
import { processSignatureDeploy } from "../src/processSignatureDeploy"
import { createInlineQueuePublisher } from "../src/queue/publisher"
import { saveAndDeploy } from "../src/saveAndDeploy"

function isSignatureDeployLog(
	value: Record<string, unknown> | SignatureDeployLog,
): value is SignatureDeployLog {
	return "results" in value && Array.isArray(value.results) && typeof value.deployId === "string"
}

function createFirestoreMock(existingTemplate?: Record<string, unknown>) {
	const templates = new Map<string, Record<string, unknown>>()
	const assignments = new Map<string, Record<string, unknown>>()
	const logs = new Map<string, SignatureDeployLog>()
	const reads = { templates: 0 }

	if(existingTemplate?.id) {
		templates.set(String(existingTemplate.id), existingTemplate)
	}

	return {
		templates,
		assignments,
		logs,
		reads,
		db: {
			collection(name: string) {
				return {
					doc(id: string) {
						return {
							id,
							async get() {
								if(name === "templates") reads.templates += 1
								const data = name === "templates"
									? templates.get(id)
									: name === SIGNATURE_DEPLOY_LOGS_COLLECTION
										? logs.get(id)
										: assignments.get(id)
								return {
									exists: Boolean(data),
									data: () => data,
								}
							},
							async set(value: Record<string, unknown> | SignatureDeployLog) {
								if(name === SIGNATURE_DEPLOY_LOGS_COLLECTION && isSignatureDeployLog(value)) {
									logs.set(id, value)
									return
								}
								if(isSignatureDeployLog(value)) return
								if(name === "templates") {
									templates.set(id, value)
									return
								}
								assignments.set(id, value)
							},
						}
					},
				}
			},
			batch() {
				const writes: Array<{ id: string, value: Record<string, unknown> }> = []
				return {
					set(ref: { id: string }, value: Record<string, unknown>) {
						writes.push({ id: ref.id, value })
					},
					async commit() {
						for(const write of writes) {
							assignments.set(write.id, write.value)
						}
					},
				}
			},
		},
	}
}

function deployDependencies(
	firestore: ReturnType<typeof createFirestoreMock>,
	gmail: GmailClient,
	overrides: Partial<Parameters<typeof processSignatureDeploy>[1]> = {},
) {
	return {
		db: firestore.db as never,
		gmail,
		loadUsers: async () => directoryUsers,
		now: () => new Date("2026-01-01T00:00:00.000Z"),
		sleep: async () => {},
		intervalMs: 0,
		maxAttempts: 3,
		...overrides,
	}
}

describe("saveAndDeploy", () => {
	it("writes template and assignments then queues one deploy", async () => {
		const firestore = createFirestoreMock()
		const published: SignatureUpdateMessage[] = []
		const request: SaveAndDeployRequest = {
			name: "Standard",
			content: "<p>{{fullName}}</p>",
			isDefault: false,
			userEmails: ["jane.doe@example.com"],
			groupIds: ["marketing"],
			organizationalUnitPaths: [],
			isScheduled: false,
		}

		const result = await saveAndDeploy(
			request,
			{ uid: "admin-1", email: "admin@example.com" },
			{
				db: firestore.db as never,
				queue: {
					async publishSignatureUpdate(message) {
						published.push(message)
					},
				},
				users: directoryUsers,
				groups: directoryGroups,
				now: () => new Date("2026-01-01T00:00:00.000Z"),
				createId: (() => {
					let count = 0
					return () => `id-${++count}`
				})(),
			},
		)

		expect(result.templateId).toBe("id-1")
		expect(result.queuedUserCount).toBe(2)
		expect(firestore.templates.get("id-1")?.name).toBe("Standard")
		expect(firestore.assignments.size).toBe(2)
		expect([...firestore.assignments.values()].map((assignment) => assignment.assignmentType)).toEqual([
			assignmentTypes.user,
			assignmentTypes.group,
		])
		expect(published).toHaveLength(1)
		expect(published[0]).toEqual({
			deployId: "id-4",
			templateId: "id-1",
			userEmails: ["jane.doe@example.com", "morgan.patel@example.com"],
		})
	})
})

describe("processSignatureDeploy", () => {
	it("reads the template once, renders every user, and writes one log", async () => {
		const gmail = new MockGmailClient()
		const firestore = createFirestoreMock({
			id: "template-1",
			content: "<p>{{fullName}} | {{email}}</p>",
		})
		const loadUsers = vi.fn(async () => directoryUsers)

		const log = await processSignatureDeploy(
			{
				deployId: "deploy-1",
				templateId: "template-1",
				userEmails: ["jane.doe@example.com", "sam.lee@example.com"],
			},
			deployDependencies(firestore, gmail, { loadUsers }),
		)

		expect(firestore.reads.templates).toBe(1)
		expect(loadUsers).toHaveBeenCalledTimes(1)
		expect(gmail.updates.map((update) => update.userEmail)).toEqual([
			"jane.doe@example.com",
			"sam.lee@example.com",
		])
		expect(gmail.updates[0]?.html).toContain("Jane Doe")
		expect(gmail.updates[1]?.html).toContain("Sam Lee")
		expect(firestore.logs.size).toBe(1)
		expect(log.results.map((result) => result.status)).toEqual(["success", "success"])
		expect(firestore.logs.get("deploy-1")).toEqual(log)
	})

	it("retries a call in-process and continues after a permanent failure", async () => {
		const updates: SignatureUpdate[] = []
		const attempts = new Map<string, number>()
		const gmail: GmailClient = {
			async updateSignature(userEmail, html) {
				const attempt = (attempts.get(userEmail) ?? 0) + 1
				attempts.set(userEmail, attempt)
				if(userEmail === "broken@example.com") {
					throw new Error("Mock Gmail failure for broken@example.com")
				}
				if(userEmail === "jane.doe@example.com" && attempt < 3) {
					throw new Error("temporary failure")
				}
				updates.push({ userEmail, html })
			},
		}
		const firestore = createFirestoreMock({
			id: "template-1",
			content: "<p>{{fullName}}</p>",
		})
		const pauses: number[] = []

		const log = await processSignatureDeploy(
			{
				deployId: "deploy-2",
				templateId: "template-1",
				userEmails: ["jane.doe@example.com", "broken@example.com"],
			},
			deployDependencies(firestore, gmail, {
				intervalMs: 25,
				maxAttempts: 3,
				sleep: async (milliseconds) => {
					pauses.push(milliseconds)
				},
			}),
		)

		expect(updates.map((update) => update.userEmail)).toEqual(["jane.doe@example.com"])
		expect(log.results).toEqual([
			{
				userEmail: "jane.doe@example.com",
				status: "success",
				attempts: 3,
				finishedAt: "2026-01-01T00:00:00.000Z",
			},
			{
				userEmail: "broken@example.com",
				status: "error",
				attempts: 3,
				error: "Mock Gmail failure for broken@example.com",
				finishedAt: "2026-01-01T00:00:00.000Z",
			},
		])
		expect(pauses).toEqual([25, 25, 25, 25, 25])
		expect(firestore.reads.templates).toBe(1)
		expect(firestore.logs.size).toBe(1)
	})

	it("does not write a log when the template is missing", async () => {
		const firestore = createFirestoreMock()
		const loadUsers = vi.fn(async () => directoryUsers)

		await expect(processSignatureDeploy(
			{
				deployId: "deploy-3",
				templateId: "missing",
				userEmails: ["jane.doe@example.com"],
			},
			deployDependencies(firestore, new MockGmailClient(), { loadUsers }),
		)).rejects.toThrow("Template not found: missing")

		expect(loadUsers).not.toHaveBeenCalled()
		expect(firestore.logs.size).toBe(0)
	})

	it("supports inline queue publishing into the consumer", async () => {
		const gmail = new MockGmailClient()
		const firestore = createFirestoreMock({
			id: "template-2",
			content: "<p>{{fullName}}</p>",
		})
		const queue = createInlineQueuePublisher((message) => processSignatureDeploy(message, deployDependencies(firestore, gmail)))

		await queue.publishSignatureUpdate({
			deployId: "deploy-4",
			templateId: "template-2",
			userEmails: ["sam.lee@example.com"],
		})

		expect(gmail.updates[0]?.userEmail).toBe("sam.lee@example.com")
		expect(gmail.updates[0]?.html).toContain("Sam Lee")
		expect(firestore.logs.get("deploy-4")?.results[0]?.status).toBe("success")
	})
})

describe("MockGmailClient", () => {
	it("throws for configured failures", async () => {
		const gmail = new MockGmailClient()
		gmail.failFor("broken@example.com")
		await expect(gmail.updateSignature("broken@example.com", "<p>x</p>"))
			.rejects.toThrow("Mock Gmail failure")
	})
})
