import { type SignatureUpdateMessage, UPDATE_SIGNATURE_FUNCTION_NAME } from "@gsuite/shared"
import { getFunctions } from "firebase-admin/functions"

export interface QueuePublisher {
	publishSignatureUpdate(message: SignatureUpdateMessage): Promise<void>
}

export interface QueueEnvironment {
	SIGNATURE_QUEUE_MODE?: string
	GMAIL_MODE?: string
	K_SERVICE?: string
	FUNCTION_TARGET?: string
}

export function shouldEnqueueCloudTask(env: QueueEnvironment): boolean {
	if(env.SIGNATURE_QUEUE_MODE === "inline") return false
	if(env.SIGNATURE_QUEUE_MODE === "cloud-tasks") return true
	if(env.K_SERVICE || env.FUNCTION_TARGET) return true
	return env.GMAIL_MODE === "real"
}

export function createCloudTasksPublisher(): QueuePublisher {
	return {
		async publishSignatureUpdate(message) {
			const queue = getFunctions().taskQueue(UPDATE_SIGNATURE_FUNCTION_NAME)
			await queue.enqueue(message)
		},
	}
}

export function createInlineQueuePublisher(
	handler: (message: SignatureUpdateMessage) => Promise<void>,
): QueuePublisher {
	return {
		async publishSignatureUpdate(message) {
			await handler(message)
		},
	}
}
