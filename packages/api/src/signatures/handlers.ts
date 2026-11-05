import { type DeployTemplateRequest, type SaveAndDeployRequest } from "@gsuite/shared"

import { createDirectoryClient } from "../directory"
import { getAdminFirestore } from "../firebase/admin"
import { createGmailClient } from "../gmail"
import { HttpError, ok, withMemberAuth } from "../http"
import { requireSignatureEditor } from "../workspace/authorize"
import { createInlineSignatureDeployQueue } from "./createSignatureQueue"
import { deployTemplate } from "./deployTemplate"
import { saveAndDeploy } from "./saveAndDeploy"

function isDeployTemplateRequest(value: unknown): value is DeployTemplateRequest {
	if(!value || typeof value !== "object") return false
	const record = value as Record<string, unknown>
	return typeof record.templateId === "string" && record.templateId.trim().length > 0
}

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

export const deployTemplateHandler = withMemberAuth(async ({ member, body }) => {
	requireSignatureEditor(member)
	if(!isDeployTemplateRequest(body)) {
		throw new HttpError("Invalid request body", 400)
	}

	const db = getAdminFirestore()
	const gmail = createGmailClient()
	const directory = await createDirectoryClient(member.workspaceAdminEmail).listDirectory()
	const queue = createInlineSignatureDeployQueue({
		db,
		gmail,
		loadUsers: async () => directory.users,
	})

	const result = await deployTemplate(body.templateId, member, {
		db,
		queue,
		users: directory.users,
	})

	return ok(result)
})

export const saveAndDeployHandler = withMemberAuth(async ({ member, body }) => {
	requireSignatureEditor(member)
	if(!isSaveAndDeployRequest(body)) {
		throw new HttpError("Invalid request body", 400)
	}

	const db = getAdminFirestore()
	const gmail = createGmailClient()
	const directory = await createDirectoryClient(member.workspaceAdminEmail).listDirectory()
	const queue = createInlineSignatureDeployQueue({
		db,
		gmail,
		loadUsers: async () => directory.users,
	})

	const result = await saveAndDeploy(body, member, {
		db,
		queue,
		users: directory.users,
		groups: directory.groups,
	})

	return ok(result)
})
