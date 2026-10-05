import { createServer, type IncomingMessage, type ServerResponse } from "node:http"

import { dispatchApiRequest } from "./dispatchApiRequest"
import { toErrorResult } from "./errors"
import { type ApiHandler } from "./types"

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "Authorization, Content-Type",
} as const

export interface LocalRoute {
	method: string
	path: string
	handler: ApiHandler
}

function getAuthorizationHeader(request: IncomingMessage): string | undefined {
	return typeof request.headers.authorization === "string"
		? request.headers.authorization
		: undefined
}

function readJsonBody(request: IncomingMessage): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = []
		request.on("data", (chunk: Buffer) => {
			chunks.push(chunk)
		})
		request.on("end", () => {
			if(chunks.length === 0) {
				resolve({})
				return
			}
			try {
				resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")))
			} catch (error) {
				reject(error)
			}
		})
		request.on("error", reject)
	})
}

function sendJson(
	response: ServerResponse,
	status: number,
	payload: unknown,
	allowMethods: string,
): void {
	response.writeHead(status, {
		"Content-Type": "application/json",
		...CORS_HEADERS,
		"Access-Control-Allow-Methods": allowMethods,
	})
	response.end(JSON.stringify(payload))
}

export function createLocalApiServer(options: {
	port: number
	routes: LocalRoute[]
	host?: string
}) {
	const host = options.host ?? "127.0.0.1"

	const server = createServer((request, response) => {
		handleRequest(request, response).catch((error: unknown) => {
			const result = toErrorResult(error)
			sendJson(response, result.status, result.payload, "GET, POST, OPTIONS")
		})
	})

	async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
		const url = new URL(request.url ?? "/", `http://${request.headers.host ?? host}`)
		const method = (request.method ?? "GET").toUpperCase()
		const body = method === "GET" || method === "HEAD" || method === "OPTIONS"
			? {}
			: await readJsonBody(request)
		const result = await dispatchApiRequest(options.routes, {
			method,
			path: url.pathname,
			authorizationHeader: getAuthorizationHeader(request),
			body,
		})
		const allowMethods = result.headers["Access-Control-Allow-Methods"] ?? "OPTIONS"

		if(result.status === 204) {
			response.writeHead(204, result.headers)
			response.end()
			return
		}

		sendJson(response, result.status, result.payload, allowMethods)
	}

	return {
		listen() {
			return new Promise<void>((resolve) => {
				server.listen(options.port, host, () => {
					process.stdout.write(`Local API listening on http://${host}:${options.port}\n`)
					resolve()
				})
			})
		},
		close() {
			return new Promise<void>((resolve, reject) => {
				server.close((error) => {
					if(error) reject(error)
					else resolve()
				})
			})
		},
	}
}
