import { createDirectoryClient } from "./directory"
import { ok, withAdminAuth } from "./http"

export const directoryHandler = withAdminAuth(async () => {
	const snapshot = await createDirectoryClient().listDirectory()
	return ok(snapshot)
})
