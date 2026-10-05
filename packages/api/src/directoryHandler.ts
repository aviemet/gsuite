import { createDirectoryClient } from "./directory"
import { ok, withMemberAuth } from "./http"

export const directoryHandler = withMemberAuth(async ({ member }) => {
	const snapshot = await createDirectoryClient(member.workspaceAdminEmail).listDirectory()
	return ok(snapshot)
})
