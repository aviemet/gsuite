import { CodeHighlightAdapterProvider, createShikiAdapter } from "@mantine/code-highlight"
import { MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { QueryClientProvider } from "@tanstack/react-query"

import { AuthProvider } from "@/frontend/hooks/useAuth"
import { queryClient } from "@/frontend/lib/query"
import { cssVariablesResolver, theme } from "@/frontend/lib/theme"

import { InnerApp } from "./InnerApp"

async function loadShiki() {
	const { createHighlighter } = await import("shiki")
	const shiki = await createHighlighter({
		langs: ["css", "html", "handlebars"],
		themes: ["catppuccin-latte"],
	})

	return shiki
}

const shikiAdapter = createShikiAdapter(loadShiki)

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
