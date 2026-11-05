import {
	type AccessRecord,
	type CustomerRecord,
	type MembershipRecord,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type DirectoryMode, readDirectoryMode } from "../directory"
import { type AuthenticatedUser } from "../firebase/admin"
import { readWorkspaceMarketplaceUrl } from "../google/serviceAccount"
import { ensureMembershipFromAccess, listAccess } from "./access"
import { loadAuthorizedMember, loadCustomer, loadMembership } from "./records"

export interface WorkspaceSession {
	directoryMode: DirectoryMode
	marketplaceUrl: string
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
		directoryMode: readDirectoryMode(),
		marketplaceUrl: readWorkspaceMarketplaceUrl(),
		customer: customer ?? null,
		membership: membership ?? null,
		access,
	}
}
