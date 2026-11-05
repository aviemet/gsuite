import {
	type AssignmentType,
	assignmentTypes,
	type DirectoryGroup,
	findConflictingAssignments,
	proposedTargetsFromRequest,
	type SaveAssignmentRequest,
	type SaveAssignmentResponse,
	type TemplateAssignmentRecord,
	uniquePreserveOrder,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { HttpError } from "../http/errors"
import { type AuthorizedMember } from "../workspace/records"
import { readAssignmentTemplateId, readResolvableAssignments, readResolvableTemplates } from "./readSignatureRecords"
import { requireCustomerTemplate } from "./requireCustomerTemplate"

export interface SaveAssignmentDependencies {
	db: Firestore
	groups: DirectoryGroup[]
	now?: () => Date
	createId?: () => string
}

interface AssignmentTarget {
	assignmentType: AssignmentType
	targetId: string
}

function assignedGroupName(groupIds: string[], groups: DirectoryGroup[]): string | null {
	if(groupIds.length !== 1) return null
	return groups.find((group) => group.id === groupIds[0])?.name ?? null
}

function assignmentTargets(request: SaveAssignmentRequest): AssignmentTarget[] {
	return [
		...request.userEmails.map((targetId) => ({
			assignmentType: assignmentTypes.user,
			targetId,
		})),
		...request.groupIds.map((targetId) => ({
			assignmentType: assignmentTypes.group,
			targetId,
		})),
		...request.organizationalUnitPaths.map((targetId) => ({
			assignmentType: assignmentTypes.organizationalUnit,
			targetId,
		})),
	]
}

export async function saveAssignment(
	request: SaveAssignmentRequest,
	actor: Pick<AuthorizedMember, "uid" | "customerId">,
	dependencies: SaveAssignmentDependencies,
): Promise<SaveAssignmentResponse> {
	const nowIso = (dependencies.now?.() ?? new Date()).toISOString()
	const createId = dependencies.createId ?? (() => crypto.randomUUID())
	const templateId = request.templateId.trim()
	if(!templateId) throw new HttpError("Template id is required", 400)

	const normalizedRequest: SaveAssignmentRequest = {
		...request,
		templateId,
		userEmails: uniquePreserveOrder(request.userEmails),
		groupIds: uniquePreserveOrder(request.groupIds),
		organizationalUnitPaths: uniquePreserveOrder(request.organizationalUnitPaths),
	}

	const templateRef = dependencies.db.collection("templates").doc(templateId)
	const current = await requireCustomerTemplate(dependencies.db, templateId, actor.customerId)

	const templatesSnap = await dependencies.db
		.collection("templates")
		.where("customerId", "==", actor.customerId)
		.get()
	const assignmentsSnap = await dependencies.db
		.collection("templateAssignments")
		.where("customerId", "==", actor.customerId)
		.get()

	const conflicts = findConflictingAssignments(
		readResolvableAssignments(assignmentsSnap.docs),
		proposedTargetsFromRequest(normalizedRequest),
		templateId,
	)
	if(conflicts.length > 0) {
		const conflict = conflicts[0]
		throw new HttpError(
			`Target already assigned to another template: ${conflict?.assignmentType}:${conflict?.targetId}`,
			409,
		)
	}

	const otherDefault = readResolvableTemplates(templatesSnap.docs).find((template) => (
		template.id !== templateId && template.isActive && template.isDefault
	))
	if(normalizedRequest.isDefault && otherDefault) {
		throw new HttpError("Another template is already the default signature", 409)
	}

	await templateRef.set({
		...current,
		isDefault: normalizedRequest.isDefault,
		isScheduled: normalizedRequest.isScheduled,
		assignedGroup: assignedGroupName(normalizedRequest.groupIds, dependencies.groups),
		updatedAt: nowIso,
	})

	const deleteBatch = dependencies.db.batch()
	for(const document of assignmentsSnap.docs) {
		if(readAssignmentTemplateId(document.data()) !== templateId) continue
		deleteBatch.delete(document.ref)
	}
	await deleteBatch.commit()

	const assignments: TemplateAssignmentRecord[] = assignmentTargets(normalizedRequest)
		.map((target, priority) => ({
			id: createId(),
			templateId,
			assignmentType: target.assignmentType,
			targetId: target.targetId,
			priority,
			customerId: actor.customerId,
			createdBy: actor.uid,
			createdAt: nowIso,
			updatedAt: nowIso,
			isActive: true,
		}))

	const writeBatch = dependencies.db.batch()
	for(const assignment of assignments) {
		writeBatch.set(
			dependencies.db.collection("templateAssignments").doc(assignment.id),
			assignment,
		)
	}
	await writeBatch.commit()

	return { templateId }
}
