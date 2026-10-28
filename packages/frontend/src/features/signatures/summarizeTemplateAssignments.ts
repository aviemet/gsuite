import { type Template, type TemplateAssignment } from "@/frontend/types/firebase"
import {
	type DirectoryGroup,
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
} from "@/shared/directoryFixtures"
import { assignmentTypes } from "@/shared/template"

export interface AssignmentDirectoryLookup {
	users?: readonly DirectoryUser[]
	groups?: readonly DirectoryGroup[]
	organizationalUnits?: readonly DirectoryOrganizationalUnit[]
}

export type AssignmentDetailKind = "user" | "group" | "organizationalUnit"

export interface AssignmentDetail {
	kind: AssignmentDetailKind
	label: string
}

export interface TemplateAssignmentSummary {
	text: string
	details: AssignmentDetail[]
	hasDetailTooltip: boolean
}

function countPhrase(count: number, singular: string, plural: string) {
	if(count === 1) return `1 ${singular}`
	return `${count} ${plural}`
}

function personLabel(
	email: string,
	directory: AssignmentDirectoryLookup,
): string {
	const user = directory.users?.find((entry) => entry.email === email)
	return user?.displayName ?? email
}

function groupLabel(
	groupId: string,
	directory: AssignmentDirectoryLookup,
): string {
	const group = directory.groups?.find((entry) => entry.id === groupId)
	return group?.name ?? groupId
}

function organizationalUnitLabel(
	path: string,
	directory: AssignmentDirectoryLookup,
): string {
	const unit = directory.organizationalUnits?.find((entry) => entry.path === path)
	if(unit) return unit.path === "/" ? unit.name : unit.path
	return path
}

export function summarizeTemplateAssignments(
	template: Pick<Template, "id" | "isDefault">,
	assignments: readonly TemplateAssignment[],
	directory: AssignmentDirectoryLookup = {},
): TemplateAssignmentSummary {
	if(template.isDefault === true) {
		return { text: "Default", details: [], hasDetailTooltip: false }
	}

	const forTemplate = assignments.filter((assignment) => (
		assignment.isActive
		&& assignment.templateId === template.id
	))
	if(forTemplate.length === 0) {
		return { text: "Unassigned", details: [], hasDetailTooltip: false }
	}

	const people = forTemplate.filter(
		(assignment) => assignment.assignmentType === assignmentTypes.user,
	)
	const groups = forTemplate.filter(
		(assignment) => assignment.assignmentType === assignmentTypes.group,
	)
	const organizationalUnits = forTemplate.filter(
		(assignment) => assignment.assignmentType === assignmentTypes.organizationalUnit,
	)

	const details: AssignmentDetail[] = [
		...organizationalUnits.map((assignment) => ({
			kind: "organizationalUnit" as const,
			label: organizationalUnitLabel(assignment.targetId, directory),
		})),
		...groups.map((assignment) => ({
			kind: "group" as const,
			label: groupLabel(assignment.targetId, directory),
		})),
		...people.map((assignment) => ({
			kind: "user" as const,
			label: personLabel(assignment.targetId, directory),
		})),
	]

	if(people.length === 1 && groups.length === 0 && organizationalUnits.length === 0) {
		return {
			text: details[0]?.label ?? personLabel(people[0]?.targetId ?? "", directory),
			details,
			hasDetailTooltip: false,
		}
	}

	if(groups.length === 1 && people.length === 0 && organizationalUnits.length === 0) {
		return {
			text: details[0]?.label ?? "1 group",
			details,
			hasDetailTooltip: false,
		}
	}

	if(organizationalUnits.length === 1 && people.length === 0 && groups.length === 0) {
		return {
			text: details[0]?.label ?? "1 organizational unit",
			details,
			hasDetailTooltip: false,
		}
	}

	const parts: string[] = []
	if(organizationalUnits.length > 0) {
		parts.push(countPhrase(organizationalUnits.length, "organizational unit", "organizational units"))
	}
	if(groups.length > 0) {
		parts.push(countPhrase(groups.length, "group", "groups"))
	}
	if(people.length > 0) {
		parts.push(countPhrase(people.length, "person", "people"))
	}

	return {
		text: parts.join(", "),
		details,
		hasDetailTooltip: details.length > 1,
	}
}
