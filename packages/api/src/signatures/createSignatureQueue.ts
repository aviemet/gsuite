import { type DirectoryUser, type SignatureUpdateMessage } from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type GmailClient } from "../gmail/client"
import {
	createCloudTasksPublisher,
	createInlineQueuePublisher,
	type QueuePublisher,
	shouldEnqueueCloudTask,
} from "../queue/publisher"
import { processSignatureDeploy } from "./processSignatureDeploy"

export function createSignatureQueue(
	processMessage: (message: SignatureUpdateMessage) => Promise<void>,
): QueuePublisher {
	return shouldEnqueueCloudTask(process.env)
		? createCloudTasksPublisher()
		: createInlineQueuePublisher(processMessage)
}

export function createInlineSignatureDeployQueue(options: {
	db: Firestore
	gmail: GmailClient
	loadUsers: () => Promise<readonly DirectoryUser[]>
}): QueuePublisher {
	return createSignatureQueue(async (message) => {
		await processSignatureDeploy(message, {
			db: options.db,
			gmail: options.gmail,
			loadUsers: options.loadUsers,
		})
	})
}
