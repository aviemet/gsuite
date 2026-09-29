import { type ApiResult, fail } from "./types"

export class HttpError extends Error {
	readonly status: number

	constructor(message: string, status: number) {
		super(message)
		this.name = "HttpError"
		this.status = status
	}
}

export function toErrorResult(error: unknown): ApiResult<{ error: string }> {
	if(error instanceof HttpError) {
		return fail(error.message, error.status)
	}

	const message = error instanceof Error ? error.message : "Unknown error"
	if(message === "Admin access required" || message === "Missing bearer token") {
		return fail(message, 401)
	}

	return fail(message, 500)
}
