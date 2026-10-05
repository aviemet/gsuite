import { Timestamp } from "firebase/firestore"

import { type AssignmentType } from "@/shared/template"

export interface Template {
	id: string
	name: string
	content: string
	variables: string[]
	conditions: string[]
	assignedGroup?: string | null
	isScheduled?: boolean
	createdBy: string
	createdAt: Timestamp
	updatedAt: Timestamp
	isActive: boolean
	customerId: string
}

export interface UserSettings {
	userId: string
	selectedTemplate: string | null
	lastUpdated: Timestamp
	customVariables: Record<string, string>
}

export interface TemplateAssignment {
	id: string
	templateId: string
	assignmentType: AssignmentType
	targetId: string
	priority: number
	conditions?: string[]
	createdBy: string
	createdAt: Timestamp
	updatedAt: Timestamp
	isActive: boolean
	customerId: string
}

export interface FirebaseConfig {
	apiKey: string
	authDomain: string
	projectId: string
	storageBucket: string
	messagingSenderId: string
	appId: string
}

// Firebase Function specific types
export interface FunctionRequest<T = unknown> {
	data: T
	auth?: {
		uid: string
		token: {
			email: string
			email_verified: boolean
			admin?: boolean
		}
	}
}

export interface FunctionResponse<T = unknown> {
	success: boolean
	data?: T
	error?: string
}
