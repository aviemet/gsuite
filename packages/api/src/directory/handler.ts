import { ok, withMemberAuth } from "../http"
import { requireAccessManager } from "../workspace/authorize"
import { createDirectoryClient } from "./createClient"
import { parseDirectoryGroupUpdateRequest, parseDirectoryUserUpdateRequest } from "./parseDirectoryUpdate"

export const directoryHandler = withMemberAuth(async ({ member }) => {
	const snapshot = await createDirectoryClient(member.workspaceAdminEmail).listDirectory()
	return ok(snapshot)
})

export const updateDirectoryUserHandler = withMemberAuth(async ({ member, body }) => {
	requireAccessManager(member)
	const update = parseDirectoryUserUpdateRequest(body)
	const user = await createDirectoryClient(member.workspaceAdminEmail).updateUser(update)
	return ok(user)
})

export const updateDirectoryGroupHandler = withMemberAuth(async ({ member, body }) => {
	requireAccessManager(member)
	const update = parseDirectoryGroupUpdateRequest(body)
	const group = await createDirectoryClient(member.workspaceAdminEmail).updateGroup(update)
	return ok(group)
})
