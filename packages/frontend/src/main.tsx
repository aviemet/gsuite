import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@mantine/core/styles.css"
import "@mantine/tiptap/styles.css"
import "@mantine/code-highlight/styles.css"
import "mantine-datatable/styles.layer.css"

import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
