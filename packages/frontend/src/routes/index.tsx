import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router"

import { AppLayout } from "@/frontend/layouts"
import { DashboardPage } from "../pages/Dashboard"
import { SettingsPage } from "../pages/Settings"
import { SignatureEditPage } from "../pages/Signatures/Edit"
import { SignaturesListPage } from "../pages/Signatures/Index"
import { SignatureViewPage } from "../pages/Signatures/Show"

// Define our root layout component that will wrap all routes
const rootRoute = createRootRoute({
	component: AppLayout,
})

// Define our routes with type-safe parameters
const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: DashboardPage,
})

const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings",
	component: SettingsPage,
})

const signaturesRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/signatures",
	component: SignaturesListPage,
})

const signatureNewRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/signatures/new",
	component: SignatureEditPage,
})

const signatureEditRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/signatures/$signatureId/edit",
	component: SignatureEditPage,
})

const signatureViewRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/signatures/$signatureId",
	component: SignatureViewPage,
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
