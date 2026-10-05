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
	const userEmail = message.userEmails[0]
	if(!userEmail) return

	const templateSnap = await dependencies.db.collection("templates").doc(message.templateId).get()
	if(!templateSnap.exists) {
		throw new Error(`Template not found: ${message.templateId}`)
	}
	if(templateSnap.data()?.customerId !== message.customerId) {
		throw new Error("Template does not belong to this customer")
	}

	const content = String(templateSnap.data()?.content ?? "")
	const person = getPersonForEmail(userEmail, new Map())
	const html = safeTemplateParse(content, getTemplatePreviewContext(person))
	await dependencies.gmail.updateSignature(userEmail, html)
}
