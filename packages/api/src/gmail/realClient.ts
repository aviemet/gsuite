import { type GmailClient } from "./client"

export class RealGmailClient implements GmailClient {
	async updateSignature(_userEmail: string, _html: string): Promise<void> {
		throw new Error("Real Gmail client is not configured yet")
	}
}
