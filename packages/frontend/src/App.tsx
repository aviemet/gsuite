import { CodeHighlightAdapterProvider, createShikiAdapter } from "@mantine/code-highlight"
import { Center, Loader, MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import { AuthProvider, useAuth } from "@/frontend/hooks/useAuth"
import { useRouterAuthSync } from "@/frontend/hooks/useRouterAuthSync"
import { queryClient } from "@/frontend/lib/query"
import { cssVariablesResolver, theme } from "@/frontend/lib/theme"

import { router } from "./routes"

async function loadShiki() {
	const { createHighlighter } = await import("shiki")
	const shiki = await createHighlighter({
		langs: ["css", "html", "handlebars"],
		themes: ["catppuccin-latte"],
	})

	return shiki
}

const shikiAdapter = createShikiAdapter(loadShiki)

function InnerApp() {
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
			<TanStackRouterDevtools router={ router } />
		</>
	)
}

export function App() {
	return (
		<QueryClientProvider client={ queryClient }>
			<MantineProvider theme={ theme } cssVariablesResolver={ cssVariablesResolver } defaultColorScheme="light">
				<Notifications />
				<CodeHighlightAdapterProvider adapter={ shikiAdapter }>
					<AuthProvider>
						<InnerApp />
					</AuthProvider>
				</CodeHighlightAdapterProvider>
			</MantineProvider>
		</QueryClientProvider>
	)
}
