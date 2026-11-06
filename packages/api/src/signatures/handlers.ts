import {
	type DeployTemplateRequest,
	type SaveAssignmentRequest,
	type SaveTemplateRequest,
} from "@gsuite/shared"

import { createDirectoryClient } from "../directory"
import { getAdminFirestore } from "../firebase/admin"
import { createGmailClient } from "../gmail"
import { HttpError, ok, withMemberAuth } from "../http"
import { requireSignatureEditor } from "../workspace/authorize"
import { assignedGroupsForSave } from "./assignedGroupsForSave"
import { createInlineSignatureDeployQueue } from "./createSignatureQueue"
import { deployTemplate } from "./deployTemplate"
import { saveAssignment } from "./saveAssignment"
import { saveTemplate } from "./saveTemplate"

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every((entry) => typeof entry === "string")
}

function isDeployTemplateRequest(value: unknown): value is DeployTemplateRequest {
	if(!isRecord(value)) return false
	return typeof value.templateId === "string" && value.templateId.trim().length > 0
}

function isSaveTemplateRequest(value: unknown): value is SaveTemplateRequest {
	if(!isRecord(value)) return false
	return typeof value.name === "string" && typeof value.content === "string"
}

function isSaveAssignmentRequest(value: unknown): value is SaveAssignmentRequest {
	if(!isRecord(value)) return false
	return typeof value.templateId === "string"
		&& typeof value.isDefault === "boolean"
		&& typeof value.isScheduled === "boolean"
		&& isStringArray(value.userEmails)
		&& isStringArray(value.groupIds)
		&& isStringArray(value.organizationalUnitPaths)
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

export const saveTemplateHandler = withMemberAuth(async ({ member, body }) => {
	requireSignatureEditor(member)
	if(!isSaveTemplateRequest(body)) {
		throw new HttpError("Invalid request body", 400)
	}

	const result = await saveTemplate(body, member, {
		db: getAdminFirestore(),
	})
	return ok(result)
})

export const saveAssignmentHandler = withMemberAuth(async ({ member, body }) => {
	requireSignatureEditor(member)
	if(!isSaveAssignmentRequest(body)) {
		throw new HttpError("Invalid request body", 400)
	}

	const directory = createDirectoryClient(member.workspaceAdminEmail)
	const groups = await assignedGroupsForSave(directory, body.groupIds)
	const result = await saveAssignment(body, member, {
		db: getAdminFirestore(),
		groups,
	})
	return ok(result)
})
