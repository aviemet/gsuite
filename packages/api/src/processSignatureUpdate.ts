import {
	getTemplatePreviewContext,
	safeTemplateParse,
	type SignatureUpdateMessage,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type GmailClient } from "./gmail/client"
import { getPersonForEmail } from "./targets/people"

export interface ProcessSignatureUpdateDependencies {
	db: Firestore
	gmail: GmailClient
}

export async function processSignatureUpdate(
	message: SignatureUpdateMessage,
	dependencies: ProcessSignatureUpdateDependencies,
): Promise<void> {
	const templateSnap = await dependencies.db.collection("templates").doc(message.templateId).get()
	if(!templateSnap.exists) {
		throw new Error(`Template not found: ${message.templateId}`)
	}

	const content = String(templateSnap.data()?.content ?? "")
	const person = getPersonForEmail(message.userEmail)
	const html = safeTemplateParse(content, getTemplatePreviewContext(person))
	await dependencies.gmail.updateSignature(message.userEmail, html)
}
