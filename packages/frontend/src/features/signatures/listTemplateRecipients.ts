import {
	type DirectoryUser,
} from "@/shared/directoryFixtures"
import {
	groupEmailsByResolvedTemplate,
	type ResolvableAssignment,
	type ResolvableTemplate,
} from "@/shared/resolveSignatureTemplateForUser"
import { type AssignmentType, assignmentTypes } from "@/shared/template"

export interface TemplateRecipient {
	email: string
	displayName: string
}

export interface RecipientTemplateFields {
	id: string
	isDefault?: boolean
	isActive: boolean
	updatedAt: string | { toDate: () => Date }
}

export interface RecipientAssignmentFields {
	templateId: string
	assignmentType: AssignmentType
	targetId: string
	isActive: boolean
}

export interface WizardRecipientValues {
	isDefault: boolean
	userEmails: readonly string[]
	groupIds: readonly string[]
	organizationalUnitPaths: readonly string[]
}

function readUpdatedAt(value: RecipientTemplateFields["updatedAt"]): string {
	if(typeof value === "string") return value
	return value.toDate().toISOString()
}

function toResolvableTemplates(
	templates: readonly RecipientTemplateFields[],
): ResolvableTemplate[] {
	return templates.map((template) => ({
		id: template.id,
		isDefault: template.isDefault === true,
		isActive: template.isActive,
		updatedAt: readUpdatedAt(template.updatedAt),
	}))
}

function toResolvableAssignments(
	assignments: readonly RecipientAssignmentFields[],
): ResolvableAssignment[] {
	return assignments.map((assignment) => ({
		templateId: assignment.templateId,
		assignmentType: assignment.assignmentType,
		targetId: assignment.targetId,
		isActive: assignment.isActive,
	}))
}

function recipientsFromEmails(
	emails: readonly string[],
	users: readonly DirectoryUser[],
): TemplateRecipient[] {
	const usersByEmail = new Map(users.map((user) => [user.email, user]))
	return emails.map((email) => ({
		email,
		displayName: usersByEmail.get(email)?.displayName ?? email,
	}))
}

export function listTemplateRecipientEmails(
	templateId: string,
	templates: readonly RecipientTemplateFields[],
	assignments: readonly RecipientAssignmentFields[],
	users: readonly DirectoryUser[],
): TemplateRecipient[] {
	const emails = users.map((user) => user.email)
	const grouped = groupEmailsByResolvedTemplate(
		emails,
		users,
		toResolvableTemplates(templates),
		toResolvableAssignments(assignments),
	)
	return recipientsFromEmails(grouped.get(templateId) ?? [], users)
}

export function listWizardRecipientEmails(
	templateId: string,
	values: WizardRecipientValues,
	templates: readonly RecipientTemplateFields[],
	assignments: readonly RecipientAssignmentFields[],
	users: readonly DirectoryUser[],
): TemplateRecipient[] {
	const existingTemplate = templates.find((template) => template.id === templateId)
	const resolvableTemplates: ResolvableTemplate[] = toResolvableTemplates(
		templates.filter((template) => template.id !== templateId),
	)
	resolvableTemplates.push({
		id: templateId,
		isDefault: values.isDefault,
		isActive: true,
		updatedAt: existingTemplate
			? readUpdatedAt(existingTemplate.updatedAt)
			: "9999-01-01T00:00:00.000Z",
	})

	const resolvableAssignments: ResolvableAssignment[] = [
		...toResolvableAssignments(
			assignments.filter((assignment) => assignment.templateId !== templateId),
		),
		...values.userEmails.map((email) => ({
			templateId,
			assignmentType: assignmentTypes.user,
			targetId: email,
			isActive: true,
		})),
		...values.groupIds.map((groupId) => ({
			templateId,
			assignmentType: assignmentTypes.group,
			targetId: groupId,
			isActive: true,
		})),
		...values.organizationalUnitPaths.map((path) => ({
			templateId,
			assignmentType: assignmentTypes.organizationalUnit,
			targetId: path,
			isActive: true,
		})),
	]

	const emails = users.map((user) => user.email)
	const grouped = groupEmailsByResolvedTemplate(
		emails,
		users,
		resolvableTemplates,
		resolvableAssignments,
	)
	return recipientsFromEmails(grouped.get(templateId) ?? [], users)
}
