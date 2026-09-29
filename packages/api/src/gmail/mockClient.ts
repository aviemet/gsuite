import { type GmailClient, type SignatureUpdate } from "./client"

export class MockGmailClient implements GmailClient {
	readonly updates: SignatureUpdate[] = []
	private readonly failingEmails = new Set<string>()

	failFor(userEmail: string): void {
		this.failingEmails.add(userEmail)
	}

	clear(): void {
		this.updates.length = 0
		this.failingEmails.clear()
	}

	async updateSignature(userEmail: string, html: string): Promise<void> {
		if(this.failingEmails.has(userEmail)) {
			throw new Error(`Mock Gmail failure for ${userEmail}`)
		}
		this.updates.push({ userEmail, html })
	}
}

let sharedMock: MockGmailClient | undefined

export function getSharedMockGmailClient(): MockGmailClient {
	if(!sharedMock) {
		sharedMock = new MockGmailClient()
	}
	return sharedMock
}
