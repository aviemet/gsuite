import {
	ACCESS_COLLECTION,
	CUSTOMERS_COLLECTION,
	membershipRoles,
	MEMBERSHIPS_COLLECTION,
	SEED_CUSTOMER_ID,
	SEED_PRIMARY_DOMAIN,
	SEED_USER_EMAIL,
	SEED_WORKSPACE_ADMIN_EMAIL,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { getAdminAuth } from "../firebase/admin"

export async function ensureEmulatorTenant(db: Firestore): Promise<void> {
	if(!process.env.FIRESTORE_EMULATOR_HOST) return

	let user
	try {
		user = await getAdminAuth().getUserByEmail(SEED_USER_EMAIL)
	} catch{
		return
	}

	const nowIso = new Date().toISOString()
	const customerRef = db.collection(CUSTOMERS_COLLECTION).doc(SEED_CUSTOMER_ID)
	const customer = await customerRef.get()
	if(!customer.exists) {
		await customerRef.set({
			id: SEED_CUSTOMER_ID,
			primaryDomain: SEED_PRIMARY_DOMAIN,
			workspaceAdminEmail: SEED_WORKSPACE_ADMIN_EMAIL,
			createdAt: nowIso,
			updatedAt: nowIso,
		})
	}

	const email = (user.email ?? SEED_USER_EMAIL).toLowerCase()
	const membershipRef = db.collection(MEMBERSHIPS_COLLECTION).doc(user.uid)
	const membership = await membershipRef.get()
	if(!membership.exists) {
		await membershipRef.set({
			uid: user.uid,
			customerId: SEED_CUSTOMER_ID,
			role: membershipRoles.superAdmin,
			email,
			createdAt: nowIso,
		})
	}

	const accessRef = db.collection(ACCESS_COLLECTION).doc(email)
	const access = await accessRef.get()
	if(!access.exists) {
		await accessRef.set({
			email,
			customerId: SEED_CUSTOMER_ID,
			role: membershipRoles.superAdmin,
			createdAt: nowIso,
			uid: user.uid,
		})
	}

	const templates = await db.collection("templates").get()
	for(const template of templates.docs) {
		const data = template.data()
		if(data && typeof data.customerId === "string") continue
		await template.ref.set({ customerId: SEED_CUSTOMER_ID }, { merge: true })
	}

	const assignments = await db.collection("templateAssignments").get()
	for(const assignment of assignments.docs) {
		const data = assignment.data()
		if(data && typeof data.customerId === "string") continue
		await assignment.ref.set({ customerId: SEED_CUSTOMER_ID }, { merge: true })
	}
}
