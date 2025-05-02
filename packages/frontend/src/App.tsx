import { MantineProvider } from "@mantine/core"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import { queryClient } from "@/frontend/lib/query"
import { theme } from "@/frontend/lib/theme"
import { router } from "./routes"

import "./reset.css"
import "@mantine/core/styles.css"
import "mantine-datatable/styles.layer.css"

const App = () => {
	return (
		<QueryClientProvider client={ queryClient }>
			<MantineProvider theme={ theme }>
				<RouterProvider router={ router } />
				<TanStackRouterDevtools router={ router } />
			</MantineProvider>
		</QueryClientProvider>
	)
}

export default App
