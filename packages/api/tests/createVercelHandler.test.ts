import { describe, expect, it, vi } from "vitest"

import { HttpError, ok } from "../src/http"
import { createVercelHandler } from "../src/http/createVercelHandler"

function createMockResponse() {
	const headers = new Map<string, string>()
	return {
		headers,
		statusCode: 200,
		body: undefined as unknown,
		ended: false,
		setHeader(name: string, value: string) {
			headers.set(name, value)
		},
		status(code: number) {
			this.statusCode = code
			return this
		},
		json(payload: unknown) {
			this.body = payload
			this.ended = true
		},
		end() {
			this.ended = true
		},
	}
}

describe("createVercelHandler", () => {
	it("handles OPTIONS and sets shared CORS headers", async () => {
		const handler = createVercelHandler({
			methods: ["GET"],
			handler: async () => ok({ ok: true }),
		})
		const response = createMockResponse()

		await handler({ method: "OPTIONS", headers: {} } as never, response as never)

		expect(response.statusCode).toBe(204)
		expect(response.ended).toBe(true)
		expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS")
	})

	it("rejects unsupported methods", async () => {
		const handler = createVercelHandler({
			methods: ["GET"],
			handler: async () => ok({ ok: true }),
		})
		const response = createMockResponse()

		await handler({ method: "POST", headers: {} } as never, response as never)

		expect(response.statusCode).toBe(405)
		expect(response.body).toEqual({ error: "Method not allowed" })
	})

	it("passes authorization and body into the handler", async () => {
		const routeHandler = vi.fn(async () => ok({ saved: true }))
		const handler = createVercelHandler({
			methods: ["POST"],
			handler: routeHandler,
		})
		const response = createMockResponse()

		await handler({
			method: "POST",
			headers: { authorization: "Bearer token" },
			body: { name: "Standard" },
		} as never, response as never)

		expect(routeHandler).toHaveBeenCalledWith({
			method: "POST",
			authorizationHeader: "Bearer token",
			body: { name: "Standard" },
		})
		expect(response.statusCode).toBe(200)
		expect(response.body).toEqual({ saved: true })
	})

	it("maps thrown HttpError to JSON responses", async () => {
		const handler = createVercelHandler({
			methods: ["GET"],
			handler: async () => {
				throw new HttpError("Nope", 403)
			},
		})
		const response = createMockResponse()

		await handler({ method: "GET", headers: {} } as never, response as never)

		expect(response.statusCode).toBe(403)
		expect(response.body).toEqual({ error: "Nope" })
	})
})
