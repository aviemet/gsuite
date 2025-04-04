import { MantineProvider } from "@mantine/core"
import { RouterProvider } from "@tanstack/react-router"

import { theme } from "@/frontend/lib/theme"
import { router } from "./routes"


const App = () => {
	return (
		<MantineProvider theme={ theme }>
			<RouterProvider router={ router } />
		</MantineProvider>
	)
}

export default App
