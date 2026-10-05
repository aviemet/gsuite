import { type AuthorizedMember, authorizeMember } from "../workspace/authorize"
import { type ApiHandler, type ApiRequestContext, type ApiResult } from "./types"

export interface MemberApiRequestContext extends ApiRequestContext {
	member: AuthorizedMember
}

export type MemberApiHandler<TPayload = unknown> = (
	context: MemberApiRequestContext,
) => Promise<ApiResult<TPayload>>

export function withMemberAuth<TPayload>(
	handler: MemberApiHandler<TPayload>,
): ApiHandler<TPayload> {
	return async (context) => {
		const member = await authorizeMember(context.authorizationHeader)
		return handler({ ...context, member })
	}
}
