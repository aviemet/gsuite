import {
	type CustomerInvite,
	type CustomerRecord,
	type MembershipRecord,
	workspaceScopes,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type AuthenticatedUser } from "../firebase/admin"
import { readWorkspaceClientId } from "../google/serviceAccount"
import { listInvites, listMembers } from "./invites"
import { loadAuthorizedMember, loadCustomer, loadMembership } from "./records"

export interface WorkspaceSession {
	clientId: string
	scopes: readonly string[]
	customer: CustomerRecord | null
	membership: MembershipRecord | null
	members: MembershipRecord[]
	invites: CustomerInvite[]
}

export async function loadWorkspaceSession(
	db: Firestore,
	user: AuthenticatedUser,
): Promise<WorkspaceSession> {
	const authorized = await loadAuthorizedMember(db, user)
	const membership = authorized ? await loadMembership(db, user.uid) : undefined
	const customer = authorized ? await loadCustomer(db, authorized.customerId) : undefined
	const members = authorized ? await listMembers(db, authorized.customerId) : []
	const invites = authorized ? await listInvites(db, authorized.customerId) : []
	return {
		clientId: readWorkspaceClientId(),
		scopes: workspaceScopes,
		customer: customer ?? null,
		membership: membership ?? null,
		members,
		invites,
	}
}
