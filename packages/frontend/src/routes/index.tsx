import {
	createRootRouteWithContext,
	createRoute,
	createRouter,
	Outlet,
	redirect,
} from "@tanstack/react-router"

import { type AuthState } from "@/frontend/hooks/useAuth"
import { AppLayout } from "@/frontend/layouts"
import { sanitizeRedirectPath } from "@/frontend/lib/auth"

import { DashboardPage } from "../pages/Dashboard"
import { LoginPage } from "../pages/Login"
import { SettingsPage } from "../pages/Settings"
import { SignatureEditPage } from "../pages/Signatures/Edit"
import { SignaturesListPage } from "../pages/Signatures/Index"

export interface RouterContext {
	auth: AuthState
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
	component: Outlet,
})

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	validateSearch: (search: Record<string, unknown>) => ({
		redirect: sanitizeRedirectPath(search.redirect),
	}),
	beforeLoad: ({ context }) => {
		if(context.auth.isAuthenticated) {
			throw redirect({ to: "/" })
		}
	},
	component: function LoginRoute() {
		const { redirect: redirectTo } = loginRoute.useSearch()
		return <LoginPage redirectTo={ redirectTo } />
	},
})

const authenticatedRoute = createRoute({
	getParentRoute: () => rootRoute,
	id: "_authenticated",
	beforeLoad: ({ context, location }) => {
		if(!context.auth.isAuthenticated) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			})
		}
	},
	component: AppLayout,
})

const indexRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "/",
	component: DashboardPage,
})

const settingsRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "/settings",
	component: SettingsPage,
})

const signaturesRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "/signatures",
	component: SignaturesListPage,
})

const signatureEditRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "/signatures/edit",
	component: SignatureEditPage,
})

const signatureEditWithIdRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "/signatures/edit/$id",
	component: SignatureEditPage,
})

const routeTree = rootRoute.addChildren([
	loginRoute,
	authenticatedRoute.addChildren([
		indexRoute,
		settingsRoute,
		signaturesRoute,
		signatureEditRoute,
		signatureEditWithIdRoute,
	]),
])

export const router = createRouter({
	routeTree,
	context: {
		auth: undefined!,
	},
})

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}
