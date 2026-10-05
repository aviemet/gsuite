import { type SignatureUpdateMessage, UPDATE_SIGNATURE_FUNCTION_NAME } from "@gsuite/shared"
import { beforeEach, describe, expect, it, vi } from "vitest"

const enqueue = vi.hoisted(() => vi.fn())
const taskQueue = vi.hoisted(() => vi.fn(() => ({ enqueue })))

vi.mock("firebase-admin/functions", () => ({
	getFunctions: () => ({
		taskQueue,
	}),
}))

import { createCloudTasksPublisher, shouldEnqueueCloudTask } from "../src/queue/publisher"

const message: SignatureUpdateMessage = {
	deployId: "deploy-1",
	templateId: "template-1",
	customerId: "customer-1",
	userEmails: ["jane.doe@example.com"],
}

describe("shouldEnqueueCloudTask", () => {
	it("stays inline for local mock runs", () => {
		expect(shouldEnqueueCloudTask({ GMAIL_MODE: "mock" })).toBe(false)
	})

	it("enqueues when Gmail is real, even outside Cloud Functions", () => {
		expect(shouldEnqueueCloudTask({ GMAIL_MODE: "real" })).toBe(true)
	})

	it("enqueues on Cloud Functions even when Gmail is mocked", () => {
		expect(shouldEnqueueCloudTask({
			GMAIL_MODE: "mock",
			K_SERVICE: "api",
		})).toBe(true)
	})

	it("lets SIGNATURE_QUEUE_MODE override the runtime", () => {
		expect(shouldEnqueueCloudTask({
			SIGNATURE_QUEUE_MODE: "inline",
			K_SERVICE: "api",
		})).toBe(false)
		expect(shouldEnqueueCloudTask({
			SIGNATURE_QUEUE_MODE: "cloud-tasks",
			GMAIL_MODE: "mock",
		})).toBe(true)
	})
})

describe("createCloudTasksPublisher", () => {
	beforeEach(() => {
		enqueue.mockReset()
		taskQueue.mockClear()
	})

	it("enqueues the signature update on the Cloud Tasks function", async () => {
		await createCloudTasksPublisher().publishSignatureUpdate(message)

		expect(taskQueue).toHaveBeenCalledWith(UPDATE_SIGNATURE_FUNCTION_NAME)
		expect(enqueue).toHaveBeenCalledWith(message)
	})
})
