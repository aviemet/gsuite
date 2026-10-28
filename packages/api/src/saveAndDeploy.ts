import {
	assignmentTypes,
	type DirectoryGroup,
	type DirectoryUser,
	extractTemplateVariables,
	findConflictingAssignments,
	groupEmailsByResolvedTemplate,
	isAssignmentType,
	proposedTargetsFromRequest,
	type ResolvableAssignment,
	type ResolvableTemplate,
	resolveTargetEmails,
	type SaveAndDeployRequest,
	type SaveAndDeployResponse,
	type TemplateAssignmentRecord,
	uniquePreserveOrder,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { HttpError } from "./http/errors"
import { type QueuePublisher } from "./queue/publisher"

export interface SaveAndDeployDependencies {
	db: Firestore
	queue: QueuePublisher
	users: DirectoryUser[]
	groups: DirectoryGroup[]
	now?: () => Date
	createId?: () => string
}

export interface SaveActor {
	uid: string
	customerId: string
}

function assignedGroupName(groupIds: string[], groups: DirectoryGroup[]): string | null {
	if(groupIds.length !== 1) return null
	return groups.find((group) => group.id === groupIds[0])?.name ?? null
}

function readString(value: Record<string, unknown> | undefined, key: string): string {
	const field = value?.[key]
	return typeof field === "string" ? field : ""
}

function readBoolean(value: Record<string, unknown> | undefined, key: string): boolean {
	return value?.[key] === true
}

function emailsFromAssignments(
	assignments: readonly ResolvableAssignment[],
	users: DirectoryUser[],
): string[] {
	const userEmails: string[] = []
	const groupIds: string[] = []
	const organizationalUnitPaths: string[] = []
	for(const assignment of assignments) {
		if(!assignment.isActive) continue
		if(assignment.assignmentType === assignmentTypes.user) userEmails.push(assignment.targetId)
		else if(assignment.assignmentType === assignmentTypes.group) groupIds.push(assignment.targetId)
		else if(assignment.assignmentType === assignmentTypes.organizationalUnit) {
			organizationalUnitPaths.push(assignment.targetId)
		}
	}
	return resolveTargetEmails({ userEmails, groupIds, organizationalUnitPaths }, users)
}

export async function saveAndDeploy(
	request: SaveAndDeployRequest,
	actor: SaveActor,
	dependencies: SaveAndDeployDependencies,
): Promise<SaveAndDeployResponse> {
	const now = dependencies.now?.() ?? new Date()
	const nowIso = now.toISOString()
	const createId = dependencies.createId ?? (() => crypto.randomUUID())
	const templateId = request.templateId?.trim() || createId()
	const variables = extractTemplateVariables(request.content)
	const normalizedRequest: SaveAndDeployRequest = {
		...request,
		userEmails: uniquePreserveOrder(request.userEmails),
		groupIds: uniquePreserveOrder(request.groupIds),
		organizationalUnitPaths: uniquePreserveOrder(request.organizationalUnitPaths),
	}
	const proposedTargets = proposedTargetsFromRequest(normalizedRequest)

	const templateRef = dependencies.db.collection("templates").doc(templateId)
	const existing = await templateRef.get()
	if(existing.exists && existing.data()?.customerId !== actor.customerId) {
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

	const existingAssignments: ResolvableAssignment[] = []
	for(const doc of assignmentsSnap.docs) {
		const data = doc.data() as Record<string, unknown>
		const assignmentType = readString(data, "assignmentType")
		if(!isAssignmentType(assignmentType)) continue
		existingAssignments.push({
			templateId: readString(data, "templateId"),
			assignmentType,
			targetId: readString(data, "targetId"),
			isActive: data.isActive !== false,
		})
	}

	const conflicts = findConflictingAssignments(existingAssignments, proposedTargets, templateId)
	if(conflicts.length > 0) {
		const conflict = conflicts[0]
		throw new HttpError(
			`Target already assigned to another template: ${conflict?.assignmentType}:${conflict?.targetId}`,
			409,
		)
	}

	const otherDefault = templatesSnap.docs.find((doc) => {
		if(doc.id === templateId) return false
		const data = doc.data() as Record<string, unknown>
		return data.isActive !== false && data.isDefault === true
	})
	if(normalizedRequest.isDefault && otherDefault) {
		throw new HttpError("Another template is already the default signature", 409)
	}

	const createdAt = existing.exists
		? String(existing.data()?.createdAt ?? nowIso)
		: nowIso
	const wasDefault = existing.exists && existing.data()?.isDefault === true

	const previousAssignmentsForTemplate = existingAssignments.filter(
		(assignment) => assignment.templateId === templateId,
	)
	const previousEmails = emailsFromAssignments(previousAssignmentsForTemplate, dependencies.users)
	const nextEmails = resolveTargetEmails({
		userEmails: normalizedRequest.userEmails,
		groupIds: normalizedRequest.groupIds,
		organizationalUnitPaths: normalizedRequest.organizationalUnitPaths,
	}, dependencies.users)

	const affectedEmails = new Set<string>([...previousEmails, ...nextEmails])
	if(normalizedRequest.isDefault || wasDefault) {
		for(const user of dependencies.users) {
			affectedEmails.add(user.email)
		}
	}

	await templateRef.set({
		id: templateId,
		name: request.name,
		content: request.content,
		variables,
		conditions: [],
		assignedGroup: assignedGroupName(normalizedRequest.groupIds, dependencies.groups),
		isDefault: normalizedRequest.isDefault,
		isScheduled: normalizedRequest.isScheduled,
		createdBy: existing.exists
			? String(existing.data()?.createdBy ?? actor.uid)
			: actor.uid,
		customerId: actor.customerId,
		createdAt,
		updatedAt: nowIso,
		isActive: true,
	})

	const deleteBatch = dependencies.db.batch()
	for(const doc of assignmentsSnap.docs) {
		const data = doc.data() as Record<string, unknown>
		if(readString(data, "templateId") !== templateId) continue
		deleteBatch.delete(doc.ref)
	}
	await deleteBatch.commit()

	const assignments: TemplateAssignmentRecord[] = []
	let priority = 0

	for(const userEmail of normalizedRequest.userEmails) {
		assignments.push({
			id: createId(),
			templateId,
			assignmentType: assignmentTypes.user,
			targetId: userEmail,
			priority: priority++,
			customerId: actor.customerId,
			createdBy: actor.uid,
			createdAt: nowIso,
			updatedAt: nowIso,
			isActive: true,
		})
	}

	for(const groupId of normalizedRequest.groupIds) {
		assignments.push({
			id: createId(),
			templateId,
			assignmentType: assignmentTypes.group,
			targetId: groupId,
			priority: priority++,
			customerId: actor.customerId,
			createdBy: actor.uid,
			createdAt: nowIso,
			updatedAt: nowIso,
			isActive: true,
		})
	}

	for(const organizationalUnitPath of normalizedRequest.organizationalUnitPaths) {
		assignments.push({
			id: createId(),
			templateId,
			assignmentType: assignmentTypes.organizationalUnit,
			targetId: organizationalUnitPath,
			priority: priority++,
			customerId: actor.customerId,
			createdBy: actor.uid,
			createdAt: nowIso,
			updatedAt: nowIso,
			isActive: true,
		})
	}

	const writeBatch = dependencies.db.batch()
	for(const assignment of assignments) {
		writeBatch.set(
			dependencies.db.collection("templateAssignments").doc(assignment.id),
			assignment,
		)
	}
	await writeBatch.commit()

	const resolvableTemplates: ResolvableTemplate[] = templatesSnap.docs
		.filter((doc) => doc.id !== templateId)
		.map((doc) => {
			const data = doc.data() as Record<string, unknown>
			return {
				id: doc.id,
				isDefault: readBoolean(data, "isDefault"),
				isActive: data.isActive !== false,
				updatedAt: readString(data, "updatedAt") || nowIso,
			}
		})
	resolvableTemplates.push({
		id: templateId,
		isDefault: normalizedRequest.isDefault,
		isActive: true,
		updatedAt: nowIso,
	})

	const resolvableAssignments: ResolvableAssignment[] = [
		...existingAssignments.filter((assignment) => assignment.templateId !== templateId),
		...assignments.map((assignment) => ({
			templateId: assignment.templateId,
			assignmentType: assignment.assignmentType,
			targetId: assignment.targetId,
			isActive: assignment.isActive,
		})),
	]

	const grouped = groupEmailsByResolvedTemplate(
		[...affectedEmails],
		dependencies.users,
		resolvableTemplates,
		resolvableAssignments,
	)

	let queuedUserCount = 0
	for(const [winningTemplateId, userEmails] of grouped) {
		if(userEmails.length === 0) continue
		await dependencies.queue.publishSignatureUpdate({
			deployId: createId(),
			templateId: winningTemplateId,
			customerId: actor.customerId,
			userEmails,
		})
		queuedUserCount += userEmails.length
	}

	return {
		templateId,
		queuedUserCount,
	}
}
