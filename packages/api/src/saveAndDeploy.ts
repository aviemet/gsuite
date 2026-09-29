import {
	assignmentTypes,
	type DirectoryGroup,
	type DirectoryUser,
	extractTemplateVariables,
	resolveTargetEmails,
	type SaveAndDeployRequest,
	type SaveAndDeployResponse,
	type TemplateAssignmentRecord,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type AuthenticatedAdmin } from "./firebase/admin"
import { type QueuePublisher } from "./queue/publisher"

export interface SaveAndDeployDependencies {
	db: Firestore
	queue: QueuePublisher
	users: DirectoryUser[]
	groups: DirectoryGroup[]
	now?: () => Date
	createId?: () => string
}

function assignedGroupName(groupIds: string[], groups: DirectoryGroup[]): string | null {
	if(groupIds.length !== 1) return null
	return groups.find((group) => group.id === groupIds[0])?.name ?? null
}

export async function saveAndDeploy(
	request: SaveAndDeployRequest,
	admin: AuthenticatedAdmin,
	dependencies: SaveAndDeployDependencies,
): Promise<SaveAndDeployResponse> {
	const now = dependencies.now?.() ?? new Date()
	const nowIso = now.toISOString()
	const createId = dependencies.createId ?? (() => crypto.randomUUID())
	const templateId = request.templateId?.trim() || createId()
	const variables = extractTemplateVariables(request.content)
	const targetEmails = resolveTargetEmails({
		userEmails: request.userEmails,
		groupIds: request.groupIds,
		organizationalUnitPaths: request.organizationalUnitPaths,
	}, dependencies.users)

	const templateRef = dependencies.db.collection("templates").doc(templateId)
	const existing = await templateRef.get()
	const createdAt = existing.exists
		? String(existing.data()?.createdAt ?? nowIso)
		: nowIso

	await templateRef.set({
		id: templateId,
		name: request.name,
		content: request.content,
		variables,
		conditions: [],
		assignedGroup: assignedGroupName(request.groupIds, dependencies.groups),
		isScheduled: request.isScheduled,
		createdBy: existing.exists
			? String(existing.data()?.createdBy ?? admin.uid)
			: admin.uid,
		createdAt,
		updatedAt: nowIso,
		isActive: true,
	})

	const assignments: TemplateAssignmentRecord[] = []
	let priority = 0

	for(const userEmail of request.userEmails) {
		assignments.push({
			id: createId(),
			templateId,
			assignmentType: assignmentTypes.user,
			targetId: userEmail,
			priority: priority++,
			createdBy: admin.uid,
			createdAt: nowIso,
			updatedAt: nowIso,
			isActive: true,
		})
	}

	for(const groupId of request.groupIds) {
		assignments.push({
			id: createId(),
			templateId,
			assignmentType: assignmentTypes.group,
			targetId: groupId,
			priority: priority++,
			createdBy: admin.uid,
			createdAt: nowIso,
			updatedAt: nowIso,
			isActive: true,
		})
	}

	for(const organizationalUnitPath of request.organizationalUnitPaths) {
		assignments.push({
			id: createId(),
			templateId,
			assignmentType: assignmentTypes.organizationalUnit,
			targetId: organizationalUnitPath,
			priority: priority++,
			createdBy: admin.uid,
			createdAt: nowIso,
			updatedAt: nowIso,
			isActive: true,
		})
	}

	const batch = dependencies.db.batch()
	for(const assignment of assignments) {
		batch.set(
			dependencies.db.collection("templateAssignments").doc(assignment.id),
			assignment,
		)
	}
	await batch.commit()

	if(targetEmails.length > 0) {
		await dependencies.queue.publishSignatureUpdate({
			deployId: createId(),
			templateId,
			userEmails: targetEmails,
		})
	}

	return {
		templateId,
		queuedUserCount: targetEmails.length,
	}
}
