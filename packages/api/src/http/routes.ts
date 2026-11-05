import { directoryHandler, updateDirectoryGroupHandler, updateDirectoryUserHandler } from "../directory"
import { deployTemplateHandler, saveAssignmentHandler, saveTemplateHandler } from "../signatures"
import {
	apiStatusHandler,
	connectWorkspaceHandler,
	removeAccessHandler,
	setAccessHandler,
	setWorkspaceAdminHandler,
	workspaceSessionHandler,
} from "../workspace/handlers"
import { type ApiHandler, type ApiRouteDefinition, ok } from "./types"

const healthHandler: ApiHandler = async () => ok({ ok: true })

export const apiRoutes: ApiRouteDefinition[] = [
	{ method: "GET", path: "/api/health", handler: healthHandler },
	{ method: "GET", path: "/api/directory", handler: directoryHandler },
	{ method: "POST", path: "/api/directory/users/update", handler: updateDirectoryUserHandler },
	{ method: "POST", path: "/api/directory/groups/update", handler: updateDirectoryGroupHandler },
	{ method: "POST", path: "/api/templates", handler: saveTemplateHandler },
	{ method: "POST", path: "/api/template-assignment", handler: saveAssignmentHandler },
	{ method: "POST", path: "/api/deploy-template", handler: deployTemplateHandler },
	{ method: "GET", path: "/api/workspace", handler: workspaceSessionHandler },
	{ method: "POST", path: "/api/workspace/connect", handler: connectWorkspaceHandler },
	{ method: "POST", path: "/api/workspace/admin", handler: setWorkspaceAdminHandler },
	{ method: "POST", path: "/api/workspace/api-status", handler: apiStatusHandler },
	{ method: "POST", path: "/api/workspace/access", handler: setAccessHandler },
	{ method: "POST", path: "/api/workspace/access/remove", handler: removeAccessHandler },
]
