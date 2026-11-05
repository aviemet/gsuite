import { ok, withMemberAuth } from "../http"
import { requireAccessManager } from "../workspace/authorize"
import { createDirectoryClient } from "./createClient"
import { parseDirectoryGroupUpdate, parseDirectoryUserUpdate } from "./parseDirectoryUpdate"

export const directoryHandler = withMemberAuth(async ({ member }) => {
	const snapshot = await createDirectoryClient(member.workspaceAdminEmail).listDirectory()
	return ok(snapshot)
})

export const updateDirectoryUserHandler = withMemberAuth(async ({ member, body }) => {
	requireAccessManager(member)
	const update = parseDirectoryUserUpdate(body)
	const snapshot = await createDirectoryClient(member.workspaceAdminEmail).updateUser(update)
	return ok(snapshot)
})

export const updateDirectoryGroupHandler = withMemberAuth(async ({ member, body }) => {
	requireAccessManager(member)
	const update = parseDirectoryGroupUpdate(body)
	const snapshot = await createDirectoryClient(member.workspaceAdminEmail).updateGroup(update)
	return ok(snapshot)
})
