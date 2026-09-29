export interface ApiResult<TPayload = unknown> {
	status: number
	payload: TPayload
}

export interface ApiRequestContext {
	method: string
	authorizationHeader: string | undefined
	body: unknown
}

export type ApiHandler<TPayload = unknown> = (
	context: ApiRequestContext,
) => Promise<ApiResult<TPayload>>

export interface ApiRouteDefinition {
	method: string
	path: string
	handler: ApiHandler
}

export function ok<TPayload>(payload: TPayload, status = 200): ApiResult<TPayload> {
	return { status, payload }
}

export function fail(message: string, status: number): ApiResult<{ error: string }> {
	return { status, payload: { error: message } }
}
