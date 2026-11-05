import { type CustomerRecord, groupEmailsByResolvedTemplate } from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type DirectoryClient } from "../directory/client"
import { type QueuePublisher } from "../queue/publisher"
import { listCustomers } from "../workspace/records"
import { errorMessage } from "./errorMessage"
import {
	readResolvableAssignments,
	readResolvableTemplates,
	readScheduledTemplateIds,
} from "./readSignatureRecords"

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

export async function enqueueScheduledDeploysForCustomer(
	customer: CustomerRecord,
	dependencies: EnqueueScheduledDeploysDependencies,
): Promise<ScheduledCustomerDeployResult> {
	const createId = dependencies.createId ?? (() => crypto.randomUUID())
	const templatesSnap = await dependencies.db
		.collection("templates")
		.where("customerId", "==", customer.id)
		.get()

	const scheduledTemplateIds = readScheduledTemplateIds(templatesSnap.docs)
	if(scheduledTemplateIds.size === 0) {
		return { customerId: customer.id, queuedUserCount: 0 }
	}

	const assignmentsSnap = await dependencies.db
		.collection("templateAssignments")
		.where("customerId", "==", customer.id)
		.get()
	const resolvableTemplates = readResolvableTemplates(templatesSnap.docs)
	const resolvableAssignments = readResolvableAssignments(assignmentsSnap.docs)

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
				error: errorMessage(error, "Scheduled deploy failed"),
			})
		}
	}

	return { customers: results, queuedUserCount }
}
