export const assignmentTypes = {
	user: "user",
	group: "group",
	organizationalUnit: "organizationalUnit",
	domain: "domain",
	schedule: "schedule",
} as const

export type AssignmentType = typeof assignmentTypes[keyof typeof assignmentTypes]

export interface TemplateRecord {
	id: string
	name: string
	content: string
	variables: string[]
	conditions: string[]
	assignedGroup?: string | null
	isScheduled?: boolean
	createdBy: string
	createdAt: string
	updatedAt: string
	isActive: boolean
	customerId: string
}

export interface TemplateAssignmentRecord {
	id: string
	templateId: string
	assignmentType: AssignmentType
	targetId: string
	priority: number
	conditions?: string[]
	customerId: string
	createdBy: string
	createdAt: string
	updatedAt: string
	isActive: boolean
}

export interface SaveAndDeployRequest {
	templateId?: string
	name: string
	content: string
	isDefault: boolean
	userEmails: string[]
	groupIds: string[]
	organizationalUnitPaths: string[]
	isScheduled: boolean
}

export interface SaveAndDeployResponse {
	templateId: string
	queuedUserCount: number
}

export interface SignatureUpdateMessage {
	deployId: string
	templateId: string
	customerId: string
	userEmails: string[]
}

export interface SignatureDeploySuccess {
	userEmail: string
	status: "success"
	attempts: number
	finishedAt: string
}

export interface SignatureDeployFailure {
	userEmail: string
	status: "error"
	attempts: number
	error: string
	finishedAt: string
}

export type SignatureDeployResult = SignatureDeployFailure | SignatureDeploySuccess

export interface SignatureDeployLog {
	deployId: string
	templateId: string
	customerId: string
	startedAt: string
	finishedAt: string
	results: SignatureDeployResult[]
}

export const UPDATE_SIGNATURE_FUNCTION_NAME = "updateSignature"
export const SIGNATURE_DEPLOY_LOGS_COLLECTION = "signatureDeployLogs"
