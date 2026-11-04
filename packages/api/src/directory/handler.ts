import { ok, withMemberAuth } from "../http"
import { createDirectoryClient } from "./createClient"

export const directoryHandler = withMemberAuth(async ({ member }) => {
	const snapshot = await createDirectoryClient(member.workspaceAdminEmail).listDirectory()
	return ok(snapshot)
})
