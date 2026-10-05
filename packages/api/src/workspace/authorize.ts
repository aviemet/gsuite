import { membershipRoles } from "@gsuite/shared"

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

export function requireOwner(member: AuthorizedMember): void {
	if(member.role !== membershipRoles.owner) {
		throw new HttpError("Owner access required", 403)
	}
}
