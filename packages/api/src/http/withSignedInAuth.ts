import { type AuthenticatedUser, verifyIdToken } from "../firebase/admin"
import { type ApiHandler, type ApiRequestContext, type ApiResult } from "./types"

export interface SignedInApiRequestContext extends ApiRequestContext {
	user: AuthenticatedUser
}

export type SignedInApiHandler<TPayload = unknown> = (
	context: SignedInApiRequestContext,
) => Promise<ApiResult<TPayload>>

export function withSignedInAuth<TPayload>(
	handler: SignedInApiHandler<TPayload>,
): ApiHandler<TPayload> {
	return async (context) => {
		const user = await verifyIdToken(context.authorizationHeader)
		return handler({ ...context, user })
	}
}
