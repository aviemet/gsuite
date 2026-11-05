import { Center, Loader } from "@mantine/core"
import { RouterProvider } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import { useAuth } from "@/frontend/hooks/useAuth"
import { useRouterAuthSync } from "@/frontend/hooks/useRouterAuthSync"

import { router } from "./routes"

export function InnerApp() {
	const auth = useAuth()
	useRouterAuthSync(auth.isLoading, auth.isAuthenticated)

	if(auth.isLoading) {
		return (
			<Center h="100vh">
				<Loader />
			</Center>
		)
	}

	return (
		<>
			<RouterProvider router={ router } context={ { auth } } />
			<TanStackRouterDevtools router={ router } position="bottom-right" />
		</>
	)
}
