import { type GmailClient } from "./client"
import { getSharedMockGmailClient } from "./mockClient"
import { RealGmailClient } from "./realClient"

export function createGmailClient(mode = process.env.GMAIL_MODE ?? "mock"): GmailClient {
	if(mode === "real") {
		return new RealGmailClient()
	}
	return getSharedMockGmailClient()
}
