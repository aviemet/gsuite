import { type DirectoryUser, groupEmailsByResolvedTemplate } from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { HttpError } from "../http/errors"
import { type QueuePublisher } from "../queue/publisher"
import { type AuthorizedMember } from "../workspace/records"
import { readResolvableAssignments, readResolvableTemplates } from "./readSignatureRecords"
import { requireCustomerTemplate } from "./requireCustomerTemplate"

export interface DeployTemplateDependencies {
	db: Firestore
	queue: QueuePublisher
	users: DirectoryUser[]
	createId?: () => string
}

export async function deployTemplate(
	templateId: string,
	actor: Pick<AuthorizedMember, "customerId">,
	dependencies: DeployTemplateDependencies,
): Promise<{ templateId: string, queuedUserCount: number }> {
	const createId = dependencies.createId ?? (() => crypto.randomUUID())
	const normalizedTemplateId = templateId.trim()
	if(!normalizedTemplateId) {
		throw new HttpError("Template id is required", 400)
	}

	await requireCustomerTemplate(dependencies.db, normalizedTemplateId, actor.customerId)

	const templatesSnap = await dependencies.db
		.collection("templates")
		.where("customerId", "==", actor.customerId)
		.get()
	const assignmentsSnap = await dependencies.db
		.collection("templateAssignments")
		.where("customerId", "==", actor.customerId)
		.get()

	const emails = dependencies.users.map((user) => user.email)
	const grouped = groupEmailsByResolvedTemplate(
		emails,
		dependencies.users,
		readResolvableTemplates(templatesSnap.docs),
		readResolvableAssignments(assignmentsSnap.docs),
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
