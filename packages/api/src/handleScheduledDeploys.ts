import { createDirectoryClient } from "./directory"
import {
	enqueueScheduledDeploys,
	type EnqueueScheduledDeploysResult,
} from "./enqueueScheduledDeploys"
import { getAdminFirestore } from "./firebase/admin"
import { handleSignatureUpdate } from "./handleSignatureUpdate"
import {
	createCloudTasksPublisher,
	createInlineQueuePublisher,
	shouldEnqueueCloudTask,
} from "./queue/publisher"

export async function handleScheduledDeploys(): Promise<EnqueueScheduledDeploysResult> {
	const db = getAdminFirestore()
	const queue = shouldEnqueueCloudTask(process.env)
		? createCloudTasksPublisher()
		: createInlineQueuePublisher(async (message) => {
			await handleSignatureUpdate(message)
		})

	return enqueueScheduledDeploys({
		db,
		queue,
		createDirectory: (subjectEmail) => createDirectoryClient(subjectEmail),
	})
}
