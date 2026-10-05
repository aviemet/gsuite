export interface ServiceAccountCredentials {
	clientEmail: string
	privateKey: string
	clientId: string
}

function textField(value: object, key: string): string | undefined {
	if(!Object.hasOwn(value, key)) return undefined
	const field = Reflect.get(value, key)
	if(typeof field !== "string" || field.length === 0) return undefined
	return field
}

export function parseServiceAccount(value: unknown): ServiceAccountCredentials | undefined {
	if(!value || typeof value !== "object") return undefined
	const clientEmail = textField(value, "client_email")
	const privateKey = textField(value, "private_key")
	const clientId = textField(value, "client_id")
	if(!clientEmail || !privateKey || !clientId) return undefined
	return { clientEmail, privateKey, clientId }
}

export function readServiceAccount(
	env: NodeJS.ProcessEnv = process.env,
): ServiceAccountCredentials | undefined {
	const raw = env.GOOGLE_SERVICE_ACCOUNT_JSON
	if(!raw) return undefined
	return parseServiceAccount(JSON.parse(raw))
}

export function requireServiceAccount(
	env: NodeJS.ProcessEnv = process.env,
): ServiceAccountCredentials {
	const account = readServiceAccount(env)
	if(!account) {
		throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured")
	}
	return account
}

export function readWorkspaceClientId(env: NodeJS.ProcessEnv = process.env): string {
	const account = readServiceAccount(env)
	if(account) return account.clientId
	if((env.GMAIL_MODE ?? "mock") === "real") return ""
	return "mock-client-id"
}
