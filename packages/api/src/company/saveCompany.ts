import { COMPANIES_COLLECTION, type CompanyProfile, type CompanyRecord } from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type AuthorizedMember } from "../workspace/records"

export interface SaveCompanyDependencies {
	db: Firestore
	now?: () => Date
}

export async function saveCompany(
	profile: CompanyProfile,
	actor: Pick<AuthorizedMember, "customerId">,
	dependencies: SaveCompanyDependencies,
): Promise<CompanyRecord> {
	const updatedAt = (dependencies.now?.() ?? new Date()).toISOString()
	const record: CompanyRecord = {
		...profile,
		customerId: actor.customerId,
		updatedAt,
	}
	await dependencies.db.collection(COMPANIES_COLLECTION).doc(actor.customerId).set(record)
	return record
}
