import {
	COMPANIES_COLLECTION,
	type CompanyRecord,
	emptyCompanyProfile,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { parseCompanyProfile } from "./parseCompanyProfile"

export interface ReadCompanyDependencies {
	db: Firestore
	createId?: () => string
}

function readUpdatedAt(value: unknown): string {
	if(!value || typeof value !== "object" || Array.isArray(value)) return ""
	if(!Object.hasOwn(value, "updatedAt")) return ""
	const field = Reflect.get(value, "updatedAt")
	return typeof field === "string" ? field : ""
}

export async function readCompany(
	customerId: string,
	dependencies: ReadCompanyDependencies,
): Promise<CompanyRecord> {
	const snapshot = await dependencies.db.collection(COMPANIES_COLLECTION).doc(customerId).get()
	const data = snapshot.exists ? snapshot.data() : undefined
	if(!data) {
		return {
			...emptyCompanyProfile(),
			customerId,
			updatedAt: "",
		}
	}

	const createId = dependencies.createId ?? (() => crypto.randomUUID())
	const profile = parseCompanyProfile(data, createId)
	return {
		...profile,
		customerId,
		updatedAt: readUpdatedAt(data),
	}
}
