import {
	createRootRouteWithContext,
	createRoute,
	createRouter,
	Outlet,
	redirect,
} from "@tanstack/react-router"

import { type AuthState } from "@/frontend/hooks/useAuth"
import { AppLayout, PublicLayout } from "@/frontend/layouts"
import { sanitizeRedirectPath } from "@/frontend/lib/auth"

import { DashboardPage } from "../pages/Dashboard"
import { HomePage } from "../pages/Home"
import { LoginPage } from "../pages/Login"
import { PrivacyPage } from "../pages/Privacy"
import { SettingsPage } from "../pages/Settings"
import { SignatureEditPage } from "../pages/Signatures/Edit"
import { SignaturesListPage } from "../pages/Signatures/Index"
import { SupportPage } from "../pages/Support"
import { TermsPage } from "../pages/Terms"

export interface RouterContext {
	auth: AuthState
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
	component: Outlet,
})

const publicRoute = createRoute({
	getParentRoute: () => rootRoute,
	id: "_public",
	component: PublicLayout,
})

const homeRoute = createRoute({
	getParentRoute: () => publicRoute,
	path: "/",
	component: HomePage,
})

const privacyRoute = createRoute({
	getParentRoute: () => publicRoute,
	path: "/privacy",
	component: PrivacyPage,
})

const termsRoute = createRoute({
	getParentRoute: () => publicRoute,
	path: "/terms",
	component: TermsPage,
})

const supportRoute = createRoute({
	getParentRoute: () => publicRoute,
	path: "/support",
	component: SupportPage,
})

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	validateSearch: (search: Record<string, unknown>) => ({
		redirect: sanitizeRedirectPath(search.redirect),
	}),
	beforeLoad: ({ context }) => {
		if(context.auth.isAuthenticated) {
			throw redirect({ to: "/admin" })
		}
	},
	component: function LoginRoute() {
		const { redirect: redirectTo } = loginRoute.useSearch()
		return <LoginPage redirectTo={ redirectTo } />
	},
})

const authenticatedRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "admin",
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
	path: "settings",
	component: SettingsPage,
})

const signaturesRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "signatures",
	component: SignaturesListPage,
})

const signatureEditRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "signatures/edit",
	component: SignatureEditPage,
})

const signatureEditWithIdRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "signatures/edit/$id",
	component: SignatureEditPage,
})

const routeTree = rootRoute.addChildren([
	publicRoute.addChildren([
		homeRoute,
		privacyRoute,
		termsRoute,
		supportRoute,
	]),
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
