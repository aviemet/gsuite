import path from "path"
// import react from "@vitejs/plugin-react" // Old plugin
import react from "@vitejs/plugin-react-swc" // New SWC-based plugin
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
	],
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./"),
			"@/shared": path.resolve(import.meta.dirname, "./packages/shared/src"),
			"@/frontend": path.resolve(import.meta.dirname, "./packages/frontend/src"),
			"@/firebase": path.resolve(import.meta.dirname, "./packages/firebase"),
			"@/functions": path.resolve(import.meta.dirname, "./packages/firebase/functions/src"),
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
