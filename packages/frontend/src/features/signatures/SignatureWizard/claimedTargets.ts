import { type Template, type TemplateAssignment } from "@/frontend/types/firebase"
import { assignmentTypes } from "@/shared/template"
import { uniquePreserveOrder } from "@/shared/uniquePreserveOrder"

export interface ClaimedTarget {
	templateId: string
	templateName: string
}

export interface ClaimedTargets {
	users: Map<string, ClaimedTarget>
	groups: Map<string, ClaimedTarget>
	organizationalUnits: Map<string, ClaimedTarget>
	defaultTemplate: ClaimedTarget | null
}

function templateNameById(templates: readonly Template[]): Map<string, string> {
	return new Map(templates.map((template) => [template.id, template.name]))
}

export function buildClaimedTargets(
	assignments: readonly TemplateAssignment[],
	templates: readonly Template[],
	currentTemplateId: string | undefined,
): ClaimedTargets {
	const names = templateNameById(templates)
	const users = new Map<string, ClaimedTarget>()
	const groups = new Map<string, ClaimedTarget>()
	const organizationalUnits = new Map<string, ClaimedTarget>()

	for(const assignment of assignments) {
		if(!assignment.isActive) continue
		if(assignment.templateId === currentTemplateId) continue
		const templateName = names.get(assignment.templateId) ?? "another template"
		const claim: ClaimedTarget = {
			templateId: assignment.templateId,
			templateName,
		}
		if(assignment.assignmentType === assignmentTypes.user) {
			if(!users.has(assignment.targetId)) users.set(assignment.targetId, claim)
		} else if(assignment.assignmentType === assignmentTypes.group) {
			if(!groups.has(assignment.targetId)) groups.set(assignment.targetId, claim)
		} else if(assignment.assignmentType === assignmentTypes.organizationalUnit) {
			if(!organizationalUnits.has(assignment.targetId)) {
				organizationalUnits.set(assignment.targetId, claim)
			}
		}
	}

	const defaultTemplateRecord = templates.find((template) => (
		template.isActive
		&& template.isDefault === true
		&& template.id !== currentTemplateId
	))
	const defaultTemplate = defaultTemplateRecord
		? {
			templateId: defaultTemplateRecord.id,
			templateName: defaultTemplateRecord.name,
		}
		: null

	return { users, groups, organizationalUnits, defaultTemplate }
}

export function assignmentTargetsForTemplate(
	assignments: readonly TemplateAssignment[],
	templateId: string,
): {
	userEmails: string[]
	groupIds: string[]
	organizationalUnitPaths: string[]
} {
	const userEmails: string[] = []
	const groupIds: string[] = []
	const organizationalUnitPaths: string[] = []

	for(const assignment of assignments) {
		if(!assignment.isActive) continue
		if(assignment.templateId !== templateId) continue
		if(assignment.assignmentType === assignmentTypes.user) {
			userEmails.push(assignment.targetId)
		} else if(assignment.assignmentType === assignmentTypes.group) {
			groupIds.push(assignment.targetId)
		} else if(assignment.assignmentType === assignmentTypes.organizationalUnit) {
			organizationalUnitPaths.push(assignment.targetId)
		}
	}

	return {
		userEmails: uniquePreserveOrder(userEmails),
		groupIds: uniquePreserveOrder(groupIds),
		organizationalUnitPaths: uniquePreserveOrder(organizationalUnitPaths),
	}
}
