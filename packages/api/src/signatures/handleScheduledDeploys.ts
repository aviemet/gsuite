import { createDirectoryClient } from "../directory"
import { getAdminFirestore } from "../firebase/admin"
import { createSignatureQueue } from "./createSignatureQueue"
import {
	enqueueScheduledDeploys,
	type EnqueueScheduledDeploysResult,
} from "./enqueueScheduledDeploys"
import { handleSignatureUpdate } from "./handleSignatureUpdate"

export async function handleScheduledDeploys(): Promise<EnqueueScheduledDeploysResult> {
	const db = getAdminFirestore()
	const queue = createSignatureQueue(async (message) => {
		await handleSignatureUpdate(message)
	})

	return enqueueScheduledDeploys({
		db,
		queue,
		createDirectory: (subjectEmail) => createDirectoryClient(subjectEmail),
	})
}
