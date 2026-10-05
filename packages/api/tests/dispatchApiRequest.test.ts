import { describe, expect, it, vi } from "vitest"

import { HttpError, ok } from "../src/http"
import { dispatchApiRequest } from "../src/http/dispatchApiRequest"
import { type ApiRouteDefinition } from "../src/http/types"

const routes: ApiRouteDefinition[] = [
	{
		method: "GET",
		path: "/api/health",
		handler: async () => ok({ ok: true }),
	},
	{
		method: "POST",
		path: "/api/save-and-deploy",
		handler: async () => ok({ saved: true }),
	},
]

describe("dispatchApiRequest", () => {
	it("handles OPTIONS and sets shared CORS headers", async () => {
		const result = await dispatchApiRequest(routes, {
			method: "OPTIONS",
			path: "/api/health",
			authorizationHeader: undefined,
			body: {},
		})

		expect(result.status).toBe(204)
		expect(result.headers["Access-Control-Allow-Methods"]).toBe("GET, OPTIONS")
		expect(result.headers["Access-Control-Allow-Headers"]).toBe("Authorization, Content-Type")
	})

	it("rejects unsupported methods", async () => {
		const result = await dispatchApiRequest(routes, {
			method: "POST",
			path: "/api/health",
			authorizationHeader: undefined,
			body: {},
		})

		expect(result.status).toBe(405)
		expect(result.payload).toEqual({ error: "Method not allowed" })
	})

	it("returns 404 for unknown paths", async () => {
		const result = await dispatchApiRequest(routes, {
			method: "GET",
			path: "/api/missing",
			authorizationHeader: undefined,
			body: {},
		})

		expect(result.status).toBe(404)
		expect(result.payload).toEqual({ error: "Not found" })
	})

	it("passes authorization and body into the handler", async () => {
		const routeHandler = vi.fn(async () => ok({ saved: true }))
		const result = await dispatchApiRequest([
			{ method: "POST", path: "/api/save-and-deploy", handler: routeHandler },
		], {
			method: "POST",
			path: "/api/save-and-deploy",
			authorizationHeader: "Bearer token",
			body: { name: "Standard" },
		})

		expect(routeHandler).toHaveBeenCalledWith({
			method: "POST",
			authorizationHeader: "Bearer token",
			body: { name: "Standard" },
		})
		expect(result.status).toBe(200)
		expect(result.payload).toEqual({ saved: true })
	})

	it("maps thrown HttpError to JSON responses", async () => {
		const result = await dispatchApiRequest([
			{
				method: "GET",
				path: "/api/health",
				handler: async () => {
					throw new HttpError("Nope", 403)
				},
			},
		], {
			method: "GET",
			path: "/api/health",
			authorizationHeader: undefined,
			body: {},
		})

		expect(result.status).toBe(403)
		expect(result.payload).toEqual({ error: "Nope" })
	})
})
