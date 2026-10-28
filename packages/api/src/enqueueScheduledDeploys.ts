import {
	type CustomerRecord,
	groupEmailsByResolvedTemplate,
	isAssignmentType,
	type ResolvableAssignment,
	type ResolvableTemplate,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type DirectoryClient } from "./directory/client"
import { type QueuePublisher } from "./queue/publisher"
import { listCustomers } from "./workspace/records"

export interface EnqueueScheduledDeploysDependencies {
	db: Firestore
	queue: QueuePublisher
	createDirectory: (subjectEmail: string) => DirectoryClient
	createId?: () => string
}

export interface ScheduledCustomerDeployResult {
	customerId: string
	queuedUserCount: number
	error?: string
}

export interface EnqueueScheduledDeploysResult {
	customers: ScheduledCustomerDeployResult[]
	queuedUserCount: number
}

function readString(value: Record<string, unknown> | undefined, key: string): string {
	const field = value?.[key]
	return typeof field === "string" ? field : ""
}

function readBoolean(value: Record<string, unknown> | undefined, key: string): boolean {
	return value?.[key] === true
}

function errorMessage(error: unknown): string {
	if(error instanceof Error && error.message) return error.message
	return "Scheduled deploy failed"
}

export async function enqueueScheduledDeploysForCustomer(
	customer: CustomerRecord,
	dependencies: EnqueueScheduledDeploysDependencies,
): Promise<ScheduledCustomerDeployResult> {
	const createId = dependencies.createId ?? (() => crypto.randomUUID())
	const templatesSnap = await dependencies.db
		.collection("templates")
		.where("customerId", "==", customer.id)
		.get()

	const resolvableTemplates: ResolvableTemplate[] = []
	const scheduledTemplateIds = new Set<string>()

	for(const doc of templatesSnap.docs) {
		const data = doc.data() as Record<string, unknown>
		const isActive = data.isActive !== false
		const isScheduled = readBoolean(data, "isScheduled")
		resolvableTemplates.push({
			id: doc.id,
			isDefault: readBoolean(data, "isDefault"),
			isActive,
			updatedAt: readString(data, "updatedAt"),
		})
		if(isActive && isScheduled) scheduledTemplateIds.add(doc.id)
	}

	if(scheduledTemplateIds.size === 0) {
		return { customerId: customer.id, queuedUserCount: 0 }
	}

	const assignmentsSnap = await dependencies.db
		.collection("templateAssignments")
		.where("customerId", "==", customer.id)
		.get()

	const resolvableAssignments: ResolvableAssignment[] = []
	for(const doc of assignmentsSnap.docs) {
		const data = doc.data() as Record<string, unknown>
		const assignmentType = readString(data, "assignmentType")
		if(!isAssignmentType(assignmentType)) continue
		resolvableAssignments.push({
			templateId: readString(data, "templateId"),
			assignmentType,
			targetId: readString(data, "targetId"),
			isActive: data.isActive !== false,
		})
	}

	const directory = await dependencies.createDirectory(customer.workspaceAdminEmail).listDirectory()
	const emails = directory.users.map((user) => user.email)
	const grouped = groupEmailsByResolvedTemplate(
		emails,
		directory.users,
		resolvableTemplates,
		resolvableAssignments,
	)

	let queuedUserCount = 0
	for(const [templateId, userEmails] of grouped) {
		if(!scheduledTemplateIds.has(templateId) || userEmails.length === 0) continue
		await dependencies.queue.publishSignatureUpdate({
			deployId: createId(),
			templateId,
			customerId: customer.id,
			userEmails,
		})
		queuedUserCount += userEmails.length
	}

	return { customerId: customer.id, queuedUserCount }
}

export async function enqueueScheduledDeploys(
	dependencies: EnqueueScheduledDeploysDependencies,
): Promise<EnqueueScheduledDeploysResult> {
	const customers = await listCustomers(dependencies.db)
	const results: ScheduledCustomerDeployResult[] = []
	let queuedUserCount = 0

	for(const customer of customers) {
		try {
			const result = await enqueueScheduledDeploysForCustomer(customer, dependencies)
			results.push(result)
			queuedUserCount += result.queuedUserCount
		} catch (error) {
			results.push({
				customerId: customer.id,
				queuedUserCount: 0,
				error: errorMessage(error),
			})
		}
	}

	return { customers: results, queuedUserCount }
}
