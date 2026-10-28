import { useRouterState } from "@tanstack/react-router"

import { useAuth } from "@/frontend/hooks/useAuth"
import { useMembershipQuery } from "@/frontend/queries/templates"
import { useWorkspaceQuery } from "@/frontend/queries/workspace"

export function settingsPathWhenUnconnected(
	pathname: string,
	hasMembership: boolean,
	isMembershipResolved: boolean,
	isAuthenticated: boolean,
): string | null {
	if(!isAuthenticated) return null
	if(!isMembershipResolved) return null
	if(hasMembership) return null
	if(pathname === "/settings" || pathname.startsWith("/settings/")) return null
	return "/settings"
}

export function isSettingsPath(pathname: string): boolean {
	return pathname === "/settings" || pathname.startsWith("/settings/")
}

export function useWorkspaceConnectionGate() {
	const auth = useAuth()
	const pathname = useRouterState({ select: (state) => state.location.pathname })
	const membership = useMembershipQuery()
	const isMembershipResolved = membership.isFetched || membership.isError
	const hasMembership = Boolean(membership.data)
	useWorkspaceQuery({ enabled: auth.isAuthenticated && hasMembership })
	const redirectTo = settingsPathWhenUnconnected(
		pathname,
		hasMembership,
		isMembershipResolved && !membership.isError,
		auth.isAuthenticated,
	)
	const blocksApp = auth.isAuthenticated
		&& !isSettingsPath(pathname)
		&& (membership.isPending || (isMembershipResolved && !membership.isError && !hasMembership))

	return {
		redirectTo,
		blocksApp,
		hasMembership,
		isMembershipPending: membership.isPending,
	}
}
