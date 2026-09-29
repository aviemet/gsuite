import {
	apiRoutes,
	dispatchApiRequest,
	handleSignatureUpdate,
} from "@gsuite/api"
import { type SignatureUpdateMessage } from "@gsuite/shared"
import { onRequest } from "firebase-functions/v2/https"
import { onTaskDispatched } from "firebase-functions/v2/tasks"

const region = "us-central1"

export const api = onRequest({
	region,
	invoker: "public",
	timeoutSeconds: 60,
}, async (request, response) => {
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
	retryConfig: {
		maxAttempts: 3,
		minBackoffSeconds: 60,
	},
	rateLimits: {
		maxConcurrentDispatches: 1,
	},
}, async (request) => {
	await handleSignatureUpdate(request.data)
})
