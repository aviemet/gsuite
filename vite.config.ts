import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
			"@/shared": path.resolve(__dirname, "./packages/shared/src"),
			"@/frontend": path.resolve(__dirname, "./packages/frontend/src"),
			"@/functions": path.resolve(__dirname, "./packages/functions/src"),
		},
	},
	server: {
		hmr: {
			// Enable HMR
			overlay: true, // Show errors as an overlay
			protocol: "ws", // Use WebSocket protocol
		},
	},
})
