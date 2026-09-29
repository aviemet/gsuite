import {
	type AuthenticatedAdmin,
	verifyAdminToken,
} from "../firebase/admin"
import { type ApiHandler, type ApiRequestContext, type ApiResult } from "./types"

export interface AdminApiRequestContext extends ApiRequestContext {
	admin: AuthenticatedAdmin
}

export type AdminApiHandler<TPayload = unknown> = (
	context: AdminApiRequestContext,
) => Promise<ApiResult<TPayload>>

export function withAdminAuth<TPayload>(
	handler: AdminApiHandler<TPayload>,
): ApiHandler<TPayload> {
	return async (context) => {
		const admin = await verifyAdminToken(context.authorizationHeader)
		return handler({ ...context, admin })
	}
}
