import { type SignatureUpdateMessage } from "@gsuite/shared"

import { createDirectoryClient } from "./directory"
import { getAdminFirestore } from "./firebase/admin"
import { createGmailClient } from "./gmail"
import { processSignatureDeploy } from "./processSignatureDeploy"

export async function handleSignatureUpdate(message: SignatureUpdateMessage): Promise<void> {
	const db = getAdminFirestore()
	const gmail = createGmailClient()
	await processSignatureDeploy(message, {
		db,
		gmail,
		loadUsers: async () => (await createDirectoryClient().listDirectory()).users,
	})
}
