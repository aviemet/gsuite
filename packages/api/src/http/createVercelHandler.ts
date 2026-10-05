import { type VercelRequest, type VercelResponse } from "@vercel/node"

import { toErrorResult } from "./errors"
import { type ApiHandler } from "./types"

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "Authorization, Content-Type",
} as const

export interface VercelHandlerOptions {
	methods: readonly string[]
	handler: ApiHandler
}

function getAuthorizationHeader(request: VercelRequest): string | undefined {
	return typeof request.headers.authorization === "string"
		? request.headers.authorization
		: undefined
}

export function createVercelHandler({
	methods,
	handler,
}: VercelHandlerOptions): (request: VercelRequest, response: VercelResponse) => Promise<void> {
	const allowedMethods = new Set(methods.map((method) => method.toUpperCase()))

	return async function vercelHandler(request: VercelRequest, response: VercelResponse) {
		response.setHeader("Access-Control-Allow-Origin", CORS_HEADERS["Access-Control-Allow-Origin"])
		response.setHeader("Access-Control-Allow-Headers", CORS_HEADERS["Access-Control-Allow-Headers"])
		response.setHeader("Access-Control-Allow-Methods", [...methods, "OPTIONS"].join(", "))

		const method = (request.method ?? "GET").toUpperCase()

		if(method === "OPTIONS") {
			response.status(204).end()
			return
		}

		if(!allowedMethods.has(method)) {
			response.status(405).json({ error: "Method not allowed" })
			return
		}

		try {
			const result = await handler({
				method,
				authorizationHeader: getAuthorizationHeader(request),
				body: request.body ?? {},
			})

			response.status(result.status).json(result.payload)
		} catch (error) {
			const result = toErrorResult(error)

			response.status(result.status).json(result.payload)
		}
	}
}
