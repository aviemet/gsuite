import { directoryHandler } from "./directoryHandler"
import { type ApiHandler, type ApiRouteDefinition, ok } from "./http"
import { saveAndDeployHandler } from "./saveAndDeployHandler"
import {
	acceptInviteHandler,
	apiStatusHandler,
	connectWorkspaceHandler,
	inviteMemberHandler,
	removeMemberHandler,
	setWorkspaceAdminHandler,
	workspaceSessionHandler,
} from "./workspace/handlers"

const healthHandler: ApiHandler = async () => ok({ ok: true })

export const apiRoutes: ApiRouteDefinition[] = [
	{ method: "GET", path: "/api/health", handler: healthHandler },
	{ method: "GET", path: "/api/directory", handler: directoryHandler },
	{ method: "POST", path: "/api/save-and-deploy", handler: saveAndDeployHandler },
	{ method: "GET", path: "/api/workspace", handler: workspaceSessionHandler },
	{ method: "POST", path: "/api/workspace/connect", handler: connectWorkspaceHandler },
	{ method: "POST", path: "/api/workspace/admin", handler: setWorkspaceAdminHandler },
	{ method: "POST", path: "/api/workspace/api-status", handler: apiStatusHandler },
	{ method: "POST", path: "/api/workspace/invites", handler: inviteMemberHandler },
	{ method: "POST", path: "/api/workspace/invites/accept", handler: acceptInviteHandler },
	{ method: "POST", path: "/api/workspace/members/remove", handler: removeMemberHandler },
]
