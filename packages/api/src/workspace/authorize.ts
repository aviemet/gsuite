import {
	canEditSignatures,
	canManageAccess,
	canManageWorkspaceSettings,
	membershipRoles,
} from "@gsuite/shared"

import { getAdminFirestore, verifyIdToken } from "../firebase/admin"
import { HttpError } from "../http/errors"
import { type AuthorizedMember, loadAuthorizedMember } from "./records"

export type { AuthorizedMember }

export async function authorizeMember(
	authorizationHeader: string | undefined,
): Promise<AuthorizedMember> {
	const user = await verifyIdToken(authorizationHeader)
	const member = await loadAuthorizedMember(getAdminFirestore(), user)
	if(!member) throw new HttpError("Membership required", 403)
	return member
}

export function requireAccessManager(member: AuthorizedMember): void {
	if(!canManageAccess(member.role)) {
		throw new HttpError("Admin access required", 403)
	}
}

export function requireWorkspaceSettingsManager(member: AuthorizedMember): void {
	if(!canManageWorkspaceSettings(member.role)) {
		throw new HttpError("Super admin access required", 403)
	}
}

export function requireSignatureEditor(member: AuthorizedMember): void {
	if(!canEditSignatures(member.role)) {
		throw new HttpError("Editor access required", 403)
	}
}

export function requireSuperAdmin(member: AuthorizedMember): void {
	if(member.role !== membershipRoles.superAdmin) {
		throw new HttpError("Super admin access required", 403)
	}
}
