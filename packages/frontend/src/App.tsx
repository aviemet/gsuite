import { CodeHighlightAdapterProvider, createShikiAdapter } from "@mantine/code-highlight"
import { MantineProvider } from "@mantine/core"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import { queryClient } from "@/frontend/lib/query"
import { theme } from "@/frontend/lib/theme"
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

const App = () => {
	return (
		<QueryClientProvider client={ queryClient }>
			<MantineProvider theme={ theme }>
				<CodeHighlightAdapterProvider adapter={ shikiAdapter }>
					<RouterProvider router={ router } />
					<TanStackRouterDevtools router={ router } />
				</CodeHighlightAdapterProvider>
			</MantineProvider>
		</QueryClientProvider>
	)
}

export default App
