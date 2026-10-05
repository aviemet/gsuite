import {
	type CustomerInvite,
	CUSTOMERS_COLLECTION,
	INVITES_COLLECTION,
	type MembershipRecord,
	membershipRoles,
	MEMBERSHIPS_COLLECTION,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type AuthenticatedUser } from "../firebase/admin"
import { HttpError } from "../http/errors"
import { type AuthorizedMember, loadMembership, parseMembership } from "./records"

export async function listMembers(db: Firestore, customerId: string): Promise<MembershipRecord[]> {
	const snapshot = await db.collection(MEMBERSHIPS_COLLECTION).where("customerId", "==", customerId).get()
	return snapshot.docs.flatMap((document) => {
		const membership = parseMembership(document.id, document.data())
		return membership ? [membership] : []
	})
}

export async function listInvites(db: Firestore, customerId: string): Promise<CustomerInvite[]> {
	const snapshot = await db.collection(CUSTOMERS_COLLECTION).doc(customerId).collection(INVITES_COLLECTION).get()
	return snapshot.docs.flatMap((document) => {
		const data = document.data()
		if(!data || typeof data.email !== "string" || typeof data.createdAt !== "string") return []
		if(!data.email || !data.createdAt) return []
		return [{ email: data.email, createdAt: data.createdAt }]
	})
}

export async function inviteMember(
	db: Firestore,
	member: AuthorizedMember,
	email: string,
	now: () => Date = () => new Date(),
): Promise<CustomerInvite> {
	if(member.role !== membershipRoles.owner) {
		throw new HttpError("Owner access required", 403)
	}
	const normalized = email.trim().toLowerCase()
	if(!normalized.includes("@")) throw new HttpError("Enter an email address", 400)
	if(normalized === (member.email ?? "").toLowerCase()) {
		throw new HttpError("You are already a member", 409)
	}
	const members = await listMembers(db, member.customerId)
	if(members.some((existing) => existing.email === normalized)) {
		throw new HttpError("That person is already a member", 409)
	}
	const invite: CustomerInvite = {
		email: normalized,
		createdAt: now().toISOString(),
	}
	await db.collection(CUSTOMERS_COLLECTION)
		.doc(member.customerId)
		.collection(INVITES_COLLECTION)
		.doc(normalized)
		.set(invite)
	return invite
}

export async function acceptInvite(
	db: Firestore,
	user: AuthenticatedUser,
	now: () => Date = () => new Date(),
): Promise<MembershipRecord> {
	const existing = await loadMembership(db, user.uid)
	if(existing) throw new HttpError("This account is already connected to a Workspace", 409)
	const email = (user.email ?? "").trim().toLowerCase()
	if(!email) throw new HttpError("Signed-in account has no email", 400)

	const snapshot = await db.collectionGroup(INVITES_COLLECTION).where("email", "==", email).limit(1).get()
	const inviteDocument = snapshot.docs[0]
	if(!inviteDocument) throw new HttpError("Invite not found", 404)
	const customerRef = inviteDocument.ref.parent.parent
	if(!customerRef) throw new HttpError("Invite not found", 404)

	const membership: MembershipRecord = {
		uid: user.uid,
		customerId: customerRef.id,
		role: membershipRoles.member,
		email,
		createdAt: now().toISOString(),
	}
	const batch = db.batch()
	batch.set(db.collection(MEMBERSHIPS_COLLECTION).doc(user.uid), membership)
	batch.delete(inviteDocument.ref)
	await batch.commit()
	return membership
}

export async function removeMember(
	db: Firestore,
	member: AuthorizedMember,
	targetUid: string,
): Promise<void> {
	if(member.role !== membershipRoles.owner) {
		throw new HttpError("Owner access required", 403)
	}
	if(targetUid === member.uid) {
		throw new HttpError("The owner cannot be removed", 403)
	}
	const target = await loadMembership(db, targetUid)
	if(!target || target.customerId !== member.customerId) {
		throw new HttpError("Member not found", 404)
	}
	if(target.role === membershipRoles.owner) {
		throw new HttpError("The owner cannot be removed", 403)
	}
	await db.collection(MEMBERSHIPS_COLLECTION).doc(targetUid).delete()
}
