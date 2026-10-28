import {
	apiRoutes,
	dispatchApiRequest,
	handleSignatureUpdate,
} from "@gsuite/api"
import { type SignatureUpdateMessage } from "@gsuite/shared"
import { defineSecret } from "firebase-functions/params"
import { onRequest } from "firebase-functions/v2/https"
import { onTaskDispatched } from "firebase-functions/v2/tasks"

const region = "us-central1"
const googleServiceAccountJson = defineSecret("GOOGLE_SERVICE_ACCOUNT_JSON")

function applyProductionWorkspaceEnv(): void {
	process.env.GMAIL_MODE = "real"
	process.env.DIRECTORY_MODE = "real"
}

export const api = onRequest({
	region,
	invoker: "public",
	timeoutSeconds: 60,
	secrets: [googleServiceAccountJson],
}, async (request, response) => {
	applyProductionWorkspaceEnv()

	const result = await dispatchApiRequest(apiRoutes, {
		method: request.method,
		path: request.path,
		authorizationHeader: request.get("authorization"),
		body: request.body,
	})

	for(const [name, value] of Object.entries(result.headers)) {
		response.setHeader(name, value)
	}

	if(result.status === 204) {
		response.status(204).send("")
		return
	}

	response.status(result.status).json(result.payload)
})

export const updateSignature = onTaskDispatched<SignatureUpdateMessage>({
	region,
	timeoutSeconds: 1800,
	secrets: [googleServiceAccountJson],
	retryConfig: {
		maxAttempts: 3,
		minBackoffSeconds: 60,
	},
	rateLimits: {
		maxConcurrentDispatches: 1,
	},
}, async (request) => {
	applyProductionWorkspaceEnv()
	await handleSignatureUpdate(request.data)
})
