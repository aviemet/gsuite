import { type DirectoryUser } from "./directoryFixtures"
import { type AssignmentType, assignmentTypes } from "./template"

export interface ResolvableTemplate {
	id: string
	isDefault: boolean
	isActive: boolean
	updatedAt: string
}

export interface ResolvableAssignment {
	templateId: string
	assignmentType: AssignmentType
	targetId: string
	isActive: boolean
}

interface RankedMatch {
	templateId: string
	updatedAt: string
	ouPathLength: number
}

function templateById(
	templates: readonly ResolvableTemplate[],
): Map<string, ResolvableTemplate> {
	return new Map(templates.map((template) => [template.id, template]))
}

function pickMostRecentlyUpdated(matches: RankedMatch[]): string | null {
	if(matches.length === 0) return null
	const sorted = [...matches].sort((left, right) => {
		if(left.updatedAt === right.updatedAt) return left.templateId.localeCompare(right.templateId)
		return right.updatedAt.localeCompare(left.updatedAt)
	})
	return sorted[0]?.templateId ?? null
}

function pickDeepestOuThenRecent(matches: RankedMatch[]): string | null {
	if(matches.length === 0) return null
	const sorted = [...matches].sort((left, right) => {
		if(left.ouPathLength !== right.ouPathLength) return right.ouPathLength - left.ouPathLength
		if(left.updatedAt === right.updatedAt) return left.templateId.localeCompare(right.templateId)
		return right.updatedAt.localeCompare(left.updatedAt)
	})
	return sorted[0]?.templateId ?? null
}

function matchesForType(
	user: DirectoryUser,
	assignments: readonly ResolvableAssignment[],
	templatesById: Map<string, ResolvableTemplate>,
	assignmentType: AssignmentType,
): RankedMatch[] {
	const matches: RankedMatch[] = []
	for(const assignment of assignments) {
		if(!assignment.isActive) continue
		if(assignment.assignmentType !== assignmentType) continue
		const template = templatesById.get(assignment.templateId)
		if(!template || !template.isActive) continue

		if(assignmentType === assignmentTypes.user) {
			if(assignment.targetId !== user.email) continue
		} else if(assignmentType === assignmentTypes.group) {
			if(!user.groupIds.includes(assignment.targetId)) continue
		} else if(assignmentType === assignmentTypes.organizationalUnit) {
			if(!user.organizationalUnitPaths.includes(assignment.targetId)) continue
		} else {
			continue
		}

		matches.push({
			templateId: template.id,
			updatedAt: template.updatedAt,
			ouPathLength: assignment.targetId.length,
		})
	}
	return matches
}

export function resolveSignatureTemplateForUser(
	user: DirectoryUser,
	templates: readonly ResolvableTemplate[],
	assignments: readonly ResolvableAssignment[],
): string | null {
	const templatesById = templateById(templates)

	const personWinner = pickMostRecentlyUpdated(
		matchesForType(user, assignments, templatesById, assignmentTypes.user),
	)
	if(personWinner) return personWinner

	const groupWinner = pickMostRecentlyUpdated(
		matchesForType(user, assignments, templatesById, assignmentTypes.group),
	)
	if(groupWinner) return groupWinner

	const ouWinner = pickDeepestOuThenRecent(
		matchesForType(user, assignments, templatesById, assignmentTypes.organizationalUnit),
	)
	if(ouWinner) return ouWinner

	const defaults = templates
		.filter((template) => template.isActive && template.isDefault)
		.map((template) => ({
			templateId: template.id,
			updatedAt: template.updatedAt,
			ouPathLength: 0,
		}))
	return pickMostRecentlyUpdated(defaults)
}

export function groupEmailsByResolvedTemplate(
	emails: readonly string[],
	users: readonly DirectoryUser[],
	templates: readonly ResolvableTemplate[],
	assignments: readonly ResolvableAssignment[],
): Map<string, string[]> {
	const usersByEmail = new Map(users.map((user) => [user.email, user]))
	const grouped = new Map<string, string[]>()

	for(const email of emails) {
		const user = usersByEmail.get(email)
		if(!user) continue
		const templateId = resolveSignatureTemplateForUser(user, templates, assignments)
		if(!templateId) continue
		const existing = grouped.get(templateId)
		if(existing) existing.push(email)
		else grouped.set(templateId, [email])
	}

	for(const [templateId, groupedEmails] of grouped) {
		grouped.set(templateId, [...groupedEmails].sort())
	}
	return grouped
}
