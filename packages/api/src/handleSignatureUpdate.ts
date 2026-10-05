import { type SignatureUpdateMessage } from "@gsuite/shared"

import { createDirectoryClient } from "./directory"
import { getAdminFirestore } from "./firebase/admin"
import { createGmailClient } from "./gmail"
import { processSignatureDeploy } from "./processSignatureDeploy"
import { loadCustomer } from "./workspace/records"

export async function handleSignatureUpdate(message: SignatureUpdateMessage): Promise<void> {
	const db = getAdminFirestore()
	const customer = await loadCustomer(db, message.customerId)
	if(!customer) throw new Error("Customer not found")
	const directory = createDirectoryClient(customer.workspaceAdminEmail)
	const gmail = createGmailClient()
	await processSignatureDeploy(message, {
		db,
		gmail,
		loadUsers: async () => (await directory.listDirectory()).users,
	})
}
