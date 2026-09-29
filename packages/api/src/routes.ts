import { directoryHandler } from "./directoryHandler"
import { type ApiHandler, type ApiRouteDefinition, ok } from "./http"
import { saveAndDeployHandler } from "./saveAndDeployHandler"

const healthHandler: ApiHandler = async () => ok({ ok: true })

export const apiRoutes: ApiRouteDefinition[] = [
	{ method: "GET", path: "/api/health", handler: healthHandler },
	{ method: "GET", path: "/api/directory", handler: directoryHandler },
	{ method: "POST", path: "/api/save-and-deploy", handler: saveAndDeployHandler },
]
