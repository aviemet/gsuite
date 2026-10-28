import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useEffect } from "react"

import { useAuth } from "@/frontend/hooks/useAuth"
import { useWorkspaceQuery } from "@/frontend/queries/workspace"

export function settingsPathWhenUnconnected(
	pathname: string,
	hasMembership: boolean,
	isWorkspaceResolved: boolean,
	isAuthenticated: boolean,
): string | null {
	if(!isAuthenticated) return null
	if(!isWorkspaceResolved) return null
	if(hasMembership) return null
	if(pathname === "/settings" || pathname.startsWith("/settings/")) return null
	return "/settings"
}

export function RequireWorkspaceConnection() {
	const auth = useAuth()
	const navigate = useNavigate()
	const pathname = useRouterState({ select: (state) => state.location.pathname })
	const workspace = useWorkspaceQuery()
	const isWorkspaceResolved = !workspace.isLoading && !workspace.isError && workspace.data !== undefined
	const hasMembership = Boolean(workspace.data?.membership)
	const redirectTo = settingsPathWhenUnconnected(
		pathname,
		hasMembership,
		isWorkspaceResolved,
		auth.isAuthenticated,
	)

	useEffect(() => {
		if(!redirectTo) return
		void navigate({ to: redirectTo })
	}, [navigate, redirectTo])

	return null
}
