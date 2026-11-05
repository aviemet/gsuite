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
import { DirectoryGroupsPage } from "../pages/Directory/Groups"
import { DirectoryGroupPage } from "../pages/Directory/Groups/Edit"
import { DirectoryOrganizationalUnitsPage } from "../pages/Directory/OrganizationalUnits"
import { DirectoryUsersPage } from "../pages/Directory/Users"
import { DirectoryUserPage } from "../pages/Directory/Users/Edit"
import { HomePage } from "../pages/Home"
import { LoginPage } from "../pages/Login"
import { PrivacyPage } from "../pages/Privacy"
import { SettingsPage } from "../pages/Settings"
import { SignatureAssignmentPage } from "../pages/Signatures/Assignment"
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
	component: function CreateSignatureRoute() {
		return <SignatureEditPage />
	},
})

const signatureEditWithIdRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "signatures/edit/$id",
	component: function EditSignatureRoute() {
		const { id } = signatureEditWithIdRoute.useParams()
		return <SignatureEditPage templateId={ id } />
	},
})

const signatureAssignmentRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "signatures/$id/assignment",
	component: function SignatureAssignmentRoute() {
		const { id } = signatureAssignmentRoute.useParams()
		return <SignatureAssignmentPage templateId={ id } />
	},
})

const directoryRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "directory",
	beforeLoad: () => {
		throw redirect({ to: "/admin/directory/users" })
	},
})

const directoryUsersRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "directory/users",
	component: DirectoryUsersPage,
})

const directoryGroupsRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "directory/groups",
	component: DirectoryGroupsPage,
})

const directoryUserRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "directory/users/$email",
	component: function DirectoryUserRoute() {
		const { email } = directoryUserRoute.useParams()
		return <DirectoryUserPage email={ email } />
	},
})

const directoryGroupRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "directory/groups/$groupId",
	component: function DirectoryGroupRoute() {
		const { groupId } = directoryGroupRoute.useParams()
		return <DirectoryGroupPage groupId={ groupId } />
	},
})

const directoryOrganizationalUnitsRoute = createRoute({
	getParentRoute: () => authenticatedRoute,
	path: "directory/ous",
	component: DirectoryOrganizationalUnitsPage,
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
		signatureAssignmentRoute,
		directoryRoute,
		directoryUsersRoute,
		directoryUserRoute,
		directoryGroupsRoute,
		directoryGroupRoute,
		directoryOrganizationalUnitsRoute,
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
