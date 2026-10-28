import { type AssignmentType, assignmentTypes, type TemplateAssignmentRecord } from "./template"

export interface ProposedAssignmentTarget {
	assignmentType: AssignmentType
	targetId: string
}

export interface AssignmentConflict {
	assignmentType: AssignmentType
	targetId: string
	templateId: string
}

type ExistingAssignment = Pick<
	TemplateAssignmentRecord,
	"assignmentType" | "targetId" | "templateId" | "isActive"
>

function claimKey(assignmentType: AssignmentType, targetId: string): string {
	return `${assignmentType}:${targetId}`
}

export function findConflictingAssignments(
	existingAssignments: readonly ExistingAssignment[],
	proposedTargets: readonly ProposedAssignmentTarget[],
	currentTemplateId: string,
): AssignmentConflict[] {
	const claimedByOther = new Map<string, AssignmentConflict>()

	for(const assignment of existingAssignments) {
		if(!assignment.isActive) continue
		if(assignment.templateId === currentTemplateId) continue
		if(
			assignment.assignmentType !== assignmentTypes.user
			&& assignment.assignmentType !== assignmentTypes.group
			&& assignment.assignmentType !== assignmentTypes.organizationalUnit
		) {
			continue
		}
		const key = claimKey(assignment.assignmentType, assignment.targetId)
		if(claimedByOther.has(key)) continue
		claimedByOther.set(key, {
			assignmentType: assignment.assignmentType,
			targetId: assignment.targetId,
			templateId: assignment.templateId,
		})
	}

	const conflicts: AssignmentConflict[] = []
	const seen = new Set<string>()
	for(const proposed of proposedTargets) {
		const key = claimKey(proposed.assignmentType, proposed.targetId)
		if(seen.has(key)) continue
		seen.add(key)
		const conflict = claimedByOther.get(key)
		if(conflict) conflicts.push(conflict)
	}
	return conflicts
}

export function proposedTargetsFromRequest(input: {
	userEmails: string[]
	groupIds: string[]
	organizationalUnitPaths: string[]
}): ProposedAssignmentTarget[] {
	return [
		...input.userEmails.map((targetId) => ({
			assignmentType: assignmentTypes.user,
			targetId,
		})),
		...input.groupIds.map((targetId) => ({
			assignmentType: assignmentTypes.group,
			targetId,
		})),
		...input.organizationalUnitPaths.map((targetId) => ({
			assignmentType: assignmentTypes.organizationalUnit,
			targetId,
		})),
	]
}
