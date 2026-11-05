import {
	isAssignmentType,
	type ResolvableAssignment,
	type ResolvableTemplate,
} from "@gsuite/shared"

interface IdentifiedDocument {
	id: string
	data(): unknown
}

interface StoredDocument {
	data(): unknown
}

function asObject(value: unknown): object | undefined {
	if(!value || typeof value !== "object" || Array.isArray(value)) return undefined
	return value
}

function readString(value: object, key: string): string {
	if(!Object.hasOwn(value, key)) return ""
	const field = Reflect.get(value, key)
	return typeof field === "string" ? field : ""
}

function readBoolean(value: object, key: string): boolean {
	return Object.hasOwn(value, key) && Reflect.get(value, key) === true
}

function isActive(value: object): boolean {
	if(!Object.hasOwn(value, "isActive")) return true
	return Reflect.get(value, "isActive") !== false
}

function resolvableTemplate(id: string, value: unknown): ResolvableTemplate | undefined {
	const data = asObject(value)
	if(!data) return undefined
	return {
		id,
		isDefault: readBoolean(data, "isDefault"),
		isActive: isActive(data),
		updatedAt: readString(data, "updatedAt"),
	}
}

export function readResolvableTemplates(
	documents: readonly IdentifiedDocument[],
): ResolvableTemplate[] {
	const templates: ResolvableTemplate[] = []
	for(const document of documents) {
		const template = resolvableTemplate(document.id, document.data())
		if(template) templates.push(template)
	}
	return templates
}

export function readScheduledTemplateIds(documents: readonly IdentifiedDocument[]): Set<string> {
	const templateIds = new Set<string>()
	for(const document of documents) {
		const data = asObject(document.data())
		if(!data || !isActive(data) || !readBoolean(data, "isScheduled")) continue
		templateIds.add(document.id)
	}
	return templateIds
}

export function readResolvableAssignments(
	documents: readonly StoredDocument[],
): ResolvableAssignment[] {
	const assignments: ResolvableAssignment[] = []
	for(const document of documents) {
		const data = asObject(document.data())
		if(!data) continue
		const assignmentType = readString(data, "assignmentType")
		if(!isAssignmentType(assignmentType)) continue
		assignments.push({
			templateId: readString(data, "templateId"),
			assignmentType,
			targetId: readString(data, "targetId"),
			isActive: isActive(data),
		})
	}
	return assignments
}

export function readAssignmentTemplateId(value: unknown): string {
	const data = asObject(value)
	if(!data) return ""
	return readString(data, "templateId")
}
