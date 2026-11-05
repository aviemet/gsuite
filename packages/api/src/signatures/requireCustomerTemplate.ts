import { type DocumentData, type Firestore } from "firebase-admin/firestore"

import { HttpError } from "../http/errors"

export async function requireCustomerTemplate(
	db: Firestore,
	templateId: string,
	customerId: string,
): Promise<DocumentData> {
	const snapshot = await db.collection("templates").doc(templateId).get()
	if(!snapshot.exists) throw new HttpError("Template not found", 404)
	const data = snapshot.data()
	if(!data || data.customerId !== customerId) {
		throw new HttpError("Template belongs to another customer", 403)
	}
	return data
}
