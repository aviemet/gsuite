import { toErrorResult } from "./errors"
import { type ApiRouteDefinition } from "./types"

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "Authorization, Content-Type",
} as const

export interface DispatchRequest {
	method: string | undefined
	path: string
	authorizationHeader: string | undefined
	body: unknown
}

export interface DispatchResult {
	status: number
	payload: unknown
	headers: Record<string, string>
}

export async function dispatchApiRequest(
	routes: readonly ApiRouteDefinition[],
	request: DispatchRequest,
): Promise<DispatchResult> {
	const method = (request.method ?? "GET").toUpperCase()
	const methodsForPath = routes
		.filter((candidate) => candidate.path === request.path)
		.map((candidate) => candidate.method.toUpperCase())
	const allowMethods = [...methodsForPath, "OPTIONS"].join(", ")
	const headers: Record<string, string> = {
		...CORS_HEADERS,
		"Access-Control-Allow-Methods": allowMethods,
	}

	if(method === "OPTIONS") {
		return { status: 204, payload: null, headers }
	}

	if(methodsForPath.length === 0) {
		return { status: 404, payload: { error: "Not found" }, headers }
	}

	const route = routes.find((candidate) => {
		return candidate.path === request.path && candidate.method.toUpperCase() === method
	})
	if(!route) {
		return { status: 405, payload: { error: "Method not allowed" }, headers }
	}

	try {
		const result = await route.handler({
			method,
			authorizationHeader: request.authorizationHeader,
			body: request.body ?? {},
		})
		return { status: result.status, payload: result.payload, headers }
	} catch (error) {
		const result = toErrorResult(error)
		return { status: result.status, payload: result.payload, headers }
	}
}
