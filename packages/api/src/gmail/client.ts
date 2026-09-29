export interface SignatureUpdate {
	userEmail: string
	html: string
}

export interface GmailClient {
	updateSignature(userEmail: string, html: string): Promise<void>
}
