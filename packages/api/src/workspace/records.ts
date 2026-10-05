import {
	type CustomerRecord,
	CUSTOMERS_COLLECTION,
	isMembershipRole,
	type MembershipRecord,
	type MembershipRole,
	MEMBERSHIPS_COLLECTION,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type AuthenticatedUser } from "../firebase/admin"

export interface AuthorizedMember {
	uid: string
	email: string | undefined
	customerId: string
	role: MembershipRole
	primaryDomain: string
	workspaceAdminEmail: string
}

function readString(value: object, key: string): string | undefined {
	if(!Object.hasOwn(value, key)) return undefined
	const field = Reflect.get(value, key)
	if(typeof field !== "string" || field.length === 0) return undefined
	return field
}

function asObject(value: unknown): object | undefined {
	if(!value || typeof value !== "object") return undefined
	return value
}

export function parseCustomer(id: string, value: unknown): CustomerRecord | undefined {
	const data = asObject(value)
	if(!data) return undefined
	const primaryDomain = readString(data, "primaryDomain")
	const workspaceAdminEmail = readString(data, "workspaceAdminEmail")
	const createdAt = readString(data, "createdAt")
	const updatedAt = readString(data, "updatedAt")
	if(!primaryDomain || !workspaceAdminEmail || !createdAt || !updatedAt) return undefined
	return { id, primaryDomain, workspaceAdminEmail, createdAt, updatedAt }
}

export function parseMembership(uid: string, value: unknown): MembershipRecord | undefined {
	const data = asObject(value)
	if(!data) return undefined
	const customerId = readString(data, "customerId")
	const email = readString(data, "email")
	const createdAt = readString(data, "createdAt")
	if(!Object.hasOwn(data, "role")) return undefined
	const role = Reflect.get(data, "role")
	if(!customerId || !email || !createdAt || !isMembershipRole(role)) return undefined
	return { uid, customerId, role, email, createdAt }
}

export async function loadCustomer(db: Firestore, customerId: string): Promise<CustomerRecord | undefined> {
	const snapshot = await db.collection(CUSTOMERS_COLLECTION).doc(customerId).get()
	if(!snapshot.exists) return undefined
	return parseCustomer(snapshot.id, snapshot.data())
}

export async function findCustomerByDomain(
	db: Firestore,
	primaryDomain: string,
): Promise<CustomerRecord | undefined> {
	const snapshot = await db.collection(CUSTOMERS_COLLECTION)
		.where("primaryDomain", "==", primaryDomain)
		.limit(1)
		.get()
	const document = snapshot.docs[0]
	if(!document) return undefined
	return parseCustomer(document.id, document.data())
}

export async function loadMembership(db: Firestore, uid: string): Promise<MembershipRecord | undefined> {
	const snapshot = await db.collection(MEMBERSHIPS_COLLECTION).doc(uid).get()
	if(!snapshot.exists) return undefined
	return parseMembership(uid, snapshot.data())
}

export async function loadAuthorizedMember(
	db: Firestore,
	user: AuthenticatedUser,
): Promise<AuthorizedMember | undefined> {
	const membership = await loadMembership(db, user.uid)
	if(!membership) return undefined
	const customer = await loadCustomer(db, membership.customerId)
	if(!customer) return undefined
	return {
		uid: user.uid,
		email: user.email,
		customerId: customer.id,
		role: membership.role,
		primaryDomain: customer.primaryDomain,
		workspaceAdminEmail: customer.workspaceAdminEmail,
	}
}
