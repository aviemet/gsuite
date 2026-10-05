import { type SaveAndDeployRequest } from "@gsuite/shared"

import { createDirectoryClient } from "./directory"
import { getAdminFirestore } from "./firebase/admin"
import { createGmailClient } from "./gmail"
import { HttpError, ok, withMemberAuth } from "./http"
import { processSignatureDeploy } from "./processSignatureDeploy"
import { createCloudTasksPublisher, createInlineQueuePublisher, shouldEnqueueCloudTask } from "./queue/publisher"
import { saveAndDeploy } from "./saveAndDeploy"

function isSaveAndDeployRequest(value: unknown): value is SaveAndDeployRequest {
	if(!value || typeof value !== "object") return false
	const record = value as Record<string, unknown>
	return typeof record.name === "string"
		&& typeof record.content === "string"
		&& typeof record.isDefault === "boolean"
		&& typeof record.isScheduled === "boolean"
		&& Array.isArray(record.userEmails)
		&& Array.isArray(record.groupIds)
		&& Array.isArray(record.organizationalUnitPaths)
}

export const saveAndDeployHandler = withMemberAuth(async ({ member, body }) => {
	if(!isSaveAndDeployRequest(body)) {
		throw new HttpError("Invalid request body", 400)
	}

	const db = getAdminFirestore()
	const gmail = createGmailClient()
	const directory = await createDirectoryClient(member.workspaceAdminEmail).listDirectory()
	const queue = shouldEnqueueCloudTask(process.env)
		? createCloudTasksPublisher()
		: createInlineQueuePublisher(async (message) => {
			await processSignatureDeploy(message, {
				db,
				gmail,
				loadUsers: async () => directory.users,
			})
		})

	const result = await saveAndDeploy(body, member, {
		db,
		queue,
		users: directory.users,
		groups: directory.groups,
	})

	return ok(result)
})
