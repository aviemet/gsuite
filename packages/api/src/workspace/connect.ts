import {
	ACCESS_COLLECTION,
	type CustomerRecord,
	CUSTOMERS_COLLECTION,
	type DirectoryAccount,
	type MembershipRecord,
	membershipRoles,
	MEMBERSHIPS_COLLECTION,
	WORKSPACE_DELEGATION_UNAUTHORIZED_MESSAGE,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type DirectoryClient } from "../directory/client"
import { type AuthenticatedUser } from "../firebase/admin"
import { HttpError } from "../http/errors"
import { type AuthorizedMember, findCustomerByDomain, loadAuthorizedMember, loadCustomer } from "./records"

function errorText(error: unknown): string {
	if(error instanceof Error) return error.message
	return ""
}

export function isDelegationError(error: unknown): boolean {
	const message = errorText(error).toLowerCase()
	return message.includes("unauthorized_client")
		|| message.includes("access_denied")
		|| message.includes("not authorized")
}

export async function readSuperAdmin(
	directory: DirectoryClient,
	email: string,
): Promise<DirectoryAccount> {
	const normalized = email.trim().toLowerCase()
	if(!normalized.includes("@")) {
		throw new HttpError("Enter a Workspace admin email", 400)
	}
	try {
		const account = await directory.getUser(normalized)
		if(!account) {
			throw new HttpError("No Workspace user was found with that email.", 404)
		}
		if(!account.isAdmin) {
			throw new HttpError(
				"That account is not a Workspace Super Admin. Enter a Super Admin email from your domain.",
				403,
			)
		}
		return account
	} catch (error) {
		if(error instanceof HttpError) throw error
		if(isDelegationError(error)) {
			throw new HttpError(WORKSPACE_DELEGATION_UNAUTHORIZED_MESSAGE, 403)
		}
		throw error
	}
}

export async function connectWorkspace(
	db: Firestore,
	user: AuthenticatedUser,
	workspaceAdminEmail: string,
	dependencies: {
		createDirectory: (subjectEmail: string) => DirectoryClient
		now?: () => Date
		createId?: () => string
	},
): Promise<CustomerRecord> {
	const existingMembership = await loadAuthorizedMember(db, user)
	if(existingMembership) {
		throw new HttpError("This account is already connected to a Workspace", 409)
	}

	const normalized = workspaceAdminEmail.trim().toLowerCase()
	const account = await readSuperAdmin(dependencies.createDirectory(normalized), normalized)
	const existingCustomer = await findCustomerByDomain(db, account.primaryDomain)
	if(existingCustomer) {
		throw new HttpError("This Workspace domain is already connected", 409)
	}

	const nowIso = (dependencies.now?.() ?? new Date()).toISOString()
	const customerId = dependencies.createId?.() ?? crypto.randomUUID()
	const email = (user.email ?? "").toLowerCase()
	if(!email) throw new HttpError("Signed-in account has no email", 400)

	const customer: CustomerRecord = {
		id: customerId,
		primaryDomain: account.primaryDomain,
		workspaceAdminEmail: account.email,
		createdAt: nowIso,
		updatedAt: nowIso,
	}
	const membership: MembershipRecord = {
		uid: user.uid,
		customerId,
		role: membershipRoles.superAdmin,
		email,
		createdAt: nowIso,
	}
	const batch = db.batch()
	batch.set(db.collection(CUSTOMERS_COLLECTION).doc(customerId), customer)
	batch.set(db.collection(MEMBERSHIPS_COLLECTION).doc(user.uid), membership)
	batch.set(db.collection(ACCESS_COLLECTION).doc(email), {
		email,
		customerId,
		role: membershipRoles.superAdmin,
		createdAt: nowIso,
		uid: user.uid,
	})
	await batch.commit()
	return customer
}

export async function setWorkspaceAdmin(
	db: Firestore,
	member: AuthorizedMember,
	workspaceAdminEmail: string,
	dependencies: {
		createDirectory: (subjectEmail: string) => DirectoryClient
		now?: () => Date
	},
): Promise<CustomerRecord> {
	if(member.role !== membershipRoles.superAdmin) {
		throw new HttpError("Super admin access required", 403)
	}
	const customer = await loadCustomer(db, member.customerId)
	if(!customer) throw new HttpError("Customer not found", 404)

	const normalized = workspaceAdminEmail.trim().toLowerCase()
	const account = await readSuperAdmin(dependencies.createDirectory(normalized), normalized)
	if(account.primaryDomain !== customer.primaryDomain) {
		throw new HttpError("Workspace admin must belong to this domain", 403)
	}

	const updated: CustomerRecord = {
		...customer,
		workspaceAdminEmail: account.email,
		updatedAt: (dependencies.now?.() ?? new Date()).toISOString(),
	}
	await db.collection(CUSTOMERS_COLLECTION).doc(customer.id).set(updated)
	return updated
}
