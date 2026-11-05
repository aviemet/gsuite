import { extractTemplateVariables, type SaveTemplateRequest, type SaveTemplateResponse } from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { HttpError } from "../http/errors"
import { type AuthorizedMember } from "../workspace/records"

export interface SaveTemplateDependencies {
	db: Firestore
	now?: () => Date
	createId?: () => string
}

export async function saveTemplate(
	request: SaveTemplateRequest,
	actor: Pick<AuthorizedMember, "uid" | "customerId">,
	dependencies: SaveTemplateDependencies,
): Promise<SaveTemplateResponse> {
	const nowIso = (dependencies.now?.() ?? new Date()).toISOString()
	const createId = dependencies.createId ?? (() => crypto.randomUUID())
	const templateId = request.templateId?.trim() || createId()
	const name = request.name.trim()
	const content = request.content
	if(!name) throw new HttpError("Name is required", 400)
	if(!content.trim()) throw new HttpError("Content is required", 400)

	const templateRef = dependencies.db.collection("templates").doc(templateId)
	const existing = await templateRef.get()
	if(existing.exists && existing.data()?.customerId !== actor.customerId) {
		throw new HttpError("Template belongs to another customer", 403)
	}

	const variables = extractTemplateVariables(content)
	if(!existing.exists) {
		await templateRef.set({
			id: templateId,
			name,
			content,
			variables,
			conditions: [],
			assignedGroup: null,
			isDefault: false,
			isScheduled: false,
			createdBy: actor.uid,
			customerId: actor.customerId,
			createdAt: nowIso,
			updatedAt: nowIso,
			isActive: true,
		})
		return { templateId }
	}

	const current = existing.data()
	if(!current) throw new HttpError("Template not found", 404)
	await templateRef.set({
		...current,
		name,
		content,
		variables,
		updatedAt: nowIso,
	})
	return { templateId }
}
