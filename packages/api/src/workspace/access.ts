import {
	ACCESS_COLLECTION,
	type AccessRecord,
	type MembershipRecord,
	type MembershipRole,
	membershipRoles,
	MEMBERSHIPS_COLLECTION,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type AuthenticatedUser } from "../firebase/admin"
import { HttpError } from "../http/errors"
import { type AuthorizedMember, loadMembership, parseMembership } from "./records"

interface AccessDocument extends AccessRecord {
	customerId: string
}

export function parseAccess(email: string, value: unknown): AccessDocument | undefined {
	if(!value || typeof value !== "object") return undefined
	const roleValue = Reflect.get(value, "role")
	const createdAt = Reflect.get(value, "createdAt")
	const uidValue = Reflect.get(value, "uid")
	const customerId = Reflect.get(value, "customerId")
	if(typeof createdAt !== "string" || createdAt.length === 0) return undefined
	if(typeof customerId !== "string" || customerId.length === 0) return undefined
	if(roleValue !== membershipRoles.superAdmin
		&& roleValue !== membershipRoles.admin
		&& roleValue !== membershipRoles.editor
		&& roleValue !== membershipRoles.viewer) {
		return undefined
	}
	const uid = typeof uidValue === "string" && uidValue.length > 0 ? uidValue : null
	return { email, role: roleValue, createdAt, uid, customerId }
}

function accessPayload(access: AccessDocument): Record<string, unknown> {
	return {
		email: access.email,
		customerId: access.customerId,
		role: access.role,
		createdAt: access.createdAt,
		uid: access.uid,
	}
}

export async function listAccess(db: Firestore, customerId: string): Promise<AccessRecord[]> {
	const snapshot = await db.collection(ACCESS_COLLECTION).where("customerId", "==", customerId).get()
	return snapshot.docs.flatMap((document) => {
		const access = parseAccess(document.id, document.data())
		if(!access) return []
		return [{
			email: access.email,
			role: access.role,
			createdAt: access.createdAt,
			uid: access.uid,
		}]
	})
}

export async function listMembers(db: Firestore, customerId: string): Promise<MembershipRecord[]> {
	const snapshot = await db.collection(MEMBERSHIPS_COLLECTION).where("customerId", "==", customerId).get()
	return snapshot.docs.flatMap((document) => {
		const membership = parseMembership(document.id, document.data())
		return membership ? [membership] : []
	})
}

export async function findAccessByEmail(
	db: Firestore,
	email: string,
): Promise<{ customerId: string, access: AccessRecord } | undefined> {
	const snapshot = await db.collection(ACCESS_COLLECTION).doc(email).get()
	if(!snapshot.exists) return undefined
	const access = parseAccess(snapshot.id, snapshot.data())
	if(!access) return undefined
	return {
		customerId: access.customerId,
		access: {
			email: access.email,
			role: access.role,
			createdAt: access.createdAt,
			uid: access.uid,
		},
	}
}

export async function ensureMembershipFromAccess(
	db: Firestore,
	user: AuthenticatedUser,
	now: () => Date = () => new Date(),
): Promise<MembershipRecord | undefined> {
	const existing = await loadMembership(db, user.uid)
	if(existing) return existing
	const email = (user.email ?? "").trim().toLowerCase()
	if(!email) return undefined
	const found = await findAccessByEmail(db, email)
	if(!found) return undefined

	const membership: MembershipRecord = {
		uid: user.uid,
		customerId: found.customerId,
		role: found.access.role,
		email,
		createdAt: now().toISOString(),
	}
	const batch = db.batch()
	batch.set(db.collection(MEMBERSHIPS_COLLECTION).doc(user.uid), membership)
	batch.set(db.collection(ACCESS_COLLECTION).doc(email), accessPayload({
		email,
		customerId: found.customerId,
		role: found.access.role,
		createdAt: found.access.createdAt,
		uid: user.uid,
	}))
	await batch.commit()
	return membership
}

function countSuperAdmins(accessList: AccessRecord[]): number {
	return accessList.filter((entry) => entry.role === membershipRoles.superAdmin).length
}

export async function setAccess(
	db: Firestore,
	actor: AuthorizedMember,
	email: string,
	role: MembershipRole,
	now: () => Date = () => new Date(),
): Promise<AccessRecord> {
	const normalized = email.trim().toLowerCase()
	if(!normalized.includes("@")) throw new HttpError("Enter an email address", 400)

	if(actor.role === membershipRoles.admin) {
		if(role === membershipRoles.superAdmin) {
			throw new HttpError("Only a super admin can grant super admin access", 403)
		}
	} else if(actor.role !== membershipRoles.superAdmin) {
		throw new HttpError("Admin access required", 403)
	}

	const accessList = await listAccess(db, actor.customerId)
	const existing = accessList.find((entry) => entry.email === normalized)
	if(existing?.role === membershipRoles.superAdmin && role !== membershipRoles.superAdmin) {
		if(actor.role !== membershipRoles.superAdmin) {
			throw new HttpError("Only a super admin can change a super admin", 403)
		}
		if(countSuperAdmins(accessList) <= 1) {
			throw new HttpError("Keep at least one super admin", 403)
		}
	}
	if(existing?.role === membershipRoles.superAdmin && actor.role === membershipRoles.admin) {
		throw new HttpError("Only a super admin can change a super admin", 403)
	}

	const members = await listMembers(db, actor.customerId)
	const member = members.find((entry) => entry.email === normalized)
	const access: AccessDocument = {
		email: normalized,
		customerId: actor.customerId,
		role,
		createdAt: existing?.createdAt ?? now().toISOString(),
		uid: member?.uid ?? existing?.uid ?? null,
	}

	const batch = db.batch()
	batch.set(db.collection(ACCESS_COLLECTION).doc(normalized), accessPayload(access))
	if(member) {
		batch.set(db.collection(MEMBERSHIPS_COLLECTION).doc(member.uid), {
			...member,
			role,
		})
	}
	await batch.commit()
	return {
		email: access.email,
		role: access.role,
		createdAt: access.createdAt,
		uid: access.uid,
	}
}

export async function removeAccess(
	db: Firestore,
	actor: AuthorizedMember,
	email: string,
): Promise<void> {
	const normalized = email.trim().toLowerCase()
	if(!normalized.includes("@")) throw new HttpError("Enter an email address", 400)

	const accessList = await listAccess(db, actor.customerId)
	const existing = accessList.find((entry) => entry.email === normalized)
	if(!existing) throw new HttpError("Person not found", 404)

	if(existing.role === membershipRoles.superAdmin) {
		if(actor.role !== membershipRoles.superAdmin) {
			throw new HttpError("Only a super admin can remove a super admin", 403)
		}
		if(countSuperAdmins(accessList) <= 1) {
			throw new HttpError("Keep at least one super admin", 403)
		}
	} else if(actor.role !== membershipRoles.superAdmin && actor.role !== membershipRoles.admin) {
		throw new HttpError("Admin access required", 403)
	}

	const members = await listMembers(db, actor.customerId)
	const member = members.find((entry) => entry.email === normalized)
	const batch = db.batch()
	batch.delete(db.collection(ACCESS_COLLECTION).doc(normalized))
	if(member) {
		batch.delete(db.collection(MEMBERSHIPS_COLLECTION).doc(member.uid))
	}
	await batch.commit()
}
