import { gmailSettingsScope } from "@gsuite/shared"
import { JWT } from "google-auth-library"
import { google } from "googleapis"

import { requireServiceAccount } from "../google/serviceAccount"
import { type GmailClient } from "./client"

function gmailFor(subject: string) {
	const account = requireServiceAccount()
	const auth = new JWT({
		email: account.clientEmail,
		key: account.privateKey,
		scopes: [gmailSettingsScope],
		subject,
	})
	return google.gmail({ version: "v1", auth })
}

export class RealGmailClient implements GmailClient {
	async probeSignatureSettings(userEmail: string): Promise<void> {
		const gmail = gmailFor(userEmail)
		await gmail.users.settings.sendAs.list({ userId: "me" })
	}

	async updateSignature(userEmail: string, html: string): Promise<void> {
		const gmail = gmailFor(userEmail)
		const listed = await gmail.users.settings.sendAs.list({ userId: "me" })
		const aliases = listed.data.sendAs ?? []
		const primary = aliases.find((alias) => alias.isPrimary) ?? aliases[0]
		const sendAsEmail = primary?.sendAsEmail
		if(!sendAsEmail) {
			throw new Error(`No send-as address for ${userEmail}`)
		}
		await gmail.users.settings.sendAs.patch({
			userId: "me",
			sendAsEmail,
			requestBody: { signature: html },
		})
	}
}
