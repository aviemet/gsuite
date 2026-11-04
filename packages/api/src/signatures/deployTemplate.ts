import {
	type DirectoryUser,
	groupEmailsByResolvedTemplate,
	isAssignmentType,
	type ResolvableAssignment,
	type ResolvableTemplate,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { HttpError } from "../http/errors"
import { type QueuePublisher } from "../queue/publisher"
import { readBoolean, readString } from "./recordFields"

export interface DeployTemplateDependencies {
	db: Firestore
	queue: QueuePublisher
	users: DirectoryUser[]
	createId?: () => string
}

export interface DeployActor {
	uid: string
	customerId: string
}

export async function deployTemplate(
	templateId: string,
	actor: DeployActor,
	dependencies: DeployTemplateDependencies,
): Promise<{ templateId: string, queuedUserCount: number }> {
	const createId = dependencies.createId ?? (() => crypto.randomUUID())
	const normalizedTemplateId = templateId.trim()
	if(!normalizedTemplateId) {
		throw new HttpError("Template id is required", 400)
	}

	const templateRef = dependencies.db.collection("templates").doc(normalizedTemplateId)
	const existing = await templateRef.get()
	if(!existing.exists) {
		throw new HttpError("Template not found", 404)
	}
	if(existing.data()?.customerId !== actor.customerId) {
		throw new HttpError("Template belongs to another customer", 403)
	}

	const templatesSnap = await dependencies.db
		.collection("templates")
		.where("customerId", "==", actor.customerId)
		.get()
	const assignmentsSnap = await dependencies.db
		.collection("templateAssignments")
		.where("customerId", "==", actor.customerId)
		.get()

	const resolvableTemplates: ResolvableTemplate[] = templatesSnap.docs.map((doc) => {
		const data = doc.data() as Record<string, unknown>
		return {
			id: doc.id,
			isDefault: readBoolean(data, "isDefault"),
			isActive: data.isActive !== false,
			updatedAt: readString(data, "updatedAt"),
		}
	})

	const resolvableAssignments: ResolvableAssignment[] = []
	for(const doc of assignmentsSnap.docs) {
		const data = doc.data() as Record<string, unknown>
		const assignmentType = readString(data, "assignmentType")
		if(!isAssignmentType(assignmentType)) continue
		resolvableAssignments.push({
			templateId: readString(data, "templateId"),
			assignmentType,
			targetId: readString(data, "targetId"),
			isActive: data.isActive !== false,
		})
	}

	const emails = dependencies.users.map((user) => user.email)
	const grouped = groupEmailsByResolvedTemplate(
		emails,
		dependencies.users,
		resolvableTemplates,
		resolvableAssignments,
	)
	const userEmails = grouped.get(normalizedTemplateId) ?? []
	if(userEmails.length === 0) {
		return { templateId: normalizedTemplateId, queuedUserCount: 0 }
	}

	await dependencies.queue.publishSignatureUpdate({
		deployId: createId(),
		templateId: normalizedTemplateId,
		customerId: actor.customerId,
		userEmails,
	})

	return {
		templateId: normalizedTemplateId,
		queuedUserCount: userEmails.length,
	}
}
