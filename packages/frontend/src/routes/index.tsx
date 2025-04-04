import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router"

import { AppLayout } from "@/frontend/layouts"

// Define our root layout component that will wrap all routes
const rootRoute = createRootRoute({
	component: AppLayout,
})

// Define our routes with type-safe parameters
const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: () => import("../pages/DashboardPage").then(m => <m.DashboardPage />),
})

const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings",
	component: () => import("../pages/SettingsPage").then(m => <m.SettingsPage />),
})

const signaturesRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/signatures",
	component: () => import("../pages/signatures/SignaturesListPage").then(m => <m.SignaturesListPage />),
})

const signatureNewRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/signatures/new",
	component: () => import("../pages/signatures/SignatureEditPage").then(m => <m.SignatureEditPage />),
})

const signatureEditRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/signatures/$signatureId/edit",
	component: () => import("../pages/signatures/SignatureEditPage").then(m => <m.SignatureEditPage />),
})

const signatureViewRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/signatures/$signatureId",
	component: () => import("../pages/signatures/SignatureViewPage").then(m => <m.SignatureViewPage />),
})

// Create and export the router instance
export const router = createRouter({
	routeTree: rootRoute.addChildren([
		indexRoute,
		settingsRoute,
		signaturesRoute,
		signatureNewRoute,
		signatureEditRoute,
		signatureViewRoute,
	]),
})

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}
