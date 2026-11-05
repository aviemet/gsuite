import { formatHtmlWithDirectives } from "@/frontend/lib"
import { type Template, type TemplateAssignment } from "@/frontend/types/firebase"

import { assignmentTargetsForTemplate } from "./claimedTargets"

export const SETUP_SOURCES = ["blank", "template", "account"] as const

export type SetupSource = typeof SETUP_SOURCES[number]

export interface SignatureDesignValues {
	setupSource: SetupSource | null
	sourceTemplateId: string | null
	sourceAccountEmail: string | null
	name: string
	content: string
}

export interface SignatureAssignmentValues {
	isDefault: boolean
	userEmails: string[]
	groupIds: string[]
	organizationalUnitPaths: string[]
	isScheduled: boolean
}

export function isSetupSource(value: string): value is SetupSource {
	return SETUP_SOURCES.some((source) => source === value)
}

export function getInitialDesignValues(template?: Template): SignatureDesignValues {
	return {
		setupSource: template ? "template" : null,
		sourceTemplateId: template?.id ?? null,
		sourceAccountEmail: null,
		name: template?.name ?? "",
		content: formatHtmlWithDirectives(template?.content ?? ""),
	}
}

export function getInitialAssignmentValues(
	template: Template,
	assignments: readonly TemplateAssignment[] = [],
): SignatureAssignmentValues {
	const targets = assignmentTargetsForTemplate(assignments, template.id)
	return {
		isDefault: template.isDefault === true,
		userEmails: targets.userEmails,
		groupIds: targets.groupIds,
		organizationalUnitPaths: targets.organizationalUnitPaths,
		isScheduled: template.isScheduled === true,
	}
}
