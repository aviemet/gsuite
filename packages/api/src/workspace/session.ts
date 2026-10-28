import {
	type AccessRecord,
	type CustomerRecord,
	type MembershipRecord,
	workspaceScopes,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type AuthenticatedUser } from "../firebase/admin"
import { readWorkspaceClientId } from "../google/serviceAccount"
import { ensureMembershipFromAccess, listAccess } from "./access"
import { loadAuthorizedMember, loadCustomer, loadMembership } from "./records"

export interface WorkspaceSession {
	clientId: string
	scopes: readonly string[]
	customer: CustomerRecord | null
	membership: MembershipRecord | null
	access: AccessRecord[]
}

export async function loadWorkspaceSession(
	db: Firestore,
	user: AuthenticatedUser,
): Promise<WorkspaceSession> {
	await ensureMembershipFromAccess(db, user)
	const authorized = await loadAuthorizedMember(db, user)
	const membership = authorized ? await loadMembership(db, user.uid) : undefined
	const customer = authorized ? await loadCustomer(db, authorized.customerId) : undefined
	const access = authorized ? await listAccess(db, authorized.customerId) : []
	return {
		clientId: readWorkspaceClientId(),
		scopes: workspaceScopes,
		customer: customer ?? null,
		membership: membership ?? null,
		access,
	}
}
