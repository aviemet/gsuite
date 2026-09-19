import { formatHtmlWithDirectives } from "@/frontend/lib"
import { Template } from "@/frontend/types/firebase"

import { groupIdFromAssignedGroup } from "./directoryTestdata"

export const SETUP_SOURCES = ["blank", "template", "account"] as const

export type SetupSource = typeof SETUP_SOURCES[number]

export interface SignatureWizardValues {
	setupSource: SetupSource | null
	sourceTemplateId: string | null
	sourceAccountEmail: string | null
	name: string
	content: string
	isDefault: boolean
	userEmails: string[]
	groupIds: string[]
	organizationalUnitPaths: string[]
	isScheduled: boolean
}

export const LAST_WIZARD_STEP = 3

export const SETUP_SOURCE_LABELS: Record<SetupSource, string> = {
	template: "From template",
	blank: "Blank canvas",
	account: "Existing account",
}

export function isSetupSource(value: string): value is SetupSource {
	return SETUP_SOURCES.some((source) => source === value)
}

export function getInitialWizardValues(template?: Template): SignatureWizardValues {
	const assignedGroupId = groupIdFromAssignedGroup(template?.assignedGroup)

	return {
		setupSource: template ? "template" : "blank",
		sourceTemplateId: template?.id ?? null,
		sourceAccountEmail: null,
		name: template?.name ?? "",
		content: formatHtmlWithDirectives(template?.content ?? ""),
		isDefault: false,
		userEmails: [],
		groupIds: assignedGroupId ? [assignedGroupId] : [],
		organizationalUnitPaths: [],
		isScheduled: template?.isScheduled === true,
	}
}
