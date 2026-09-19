import path from "node:path"
import react from "@vitejs/plugin-react-swc"
import wyw from "@wyw-in-js/vite"
import { defineConfig } from "vite"

export default defineConfig({
	envDir: path.resolve(import.meta.dirname, ".."),
	plugins: [
		react(),
		wyw({
			include: ["src/**/*.{ts,tsx}"],
		}),
	],
	resolve: {
		alias: {
			"@/frontend": path.resolve(import.meta.dirname, "./src"),
			"@/shared": path.resolve(import.meta.dirname, "../shared/src"),
			"@/functions": path.resolve(import.meta.dirname, "../functions/src"),
		},
		dedupe: [
			"react",
			"react-dom",
			"@tiptap/core",
			"@tiptap/pm",
			"prosemirror-model",
			"prosemirror-state",
			"prosemirror-view",
			"prosemirror-transform",
		],
	},
	cacheDir: ".vite-cache",
	build: {
		rolldownOptions: {
			output: {
				codeSplitting: {
					groups: [
						{
							name: "vendor",
							test: /node_modules[\\/](?:react|react-dom)(?:[\\/]|$)/,
						},
						{
							name: "mantine",
							test: /node_modules[\\/]@mantine[\\/](?:core|hooks)(?:[\\/]|$)/,
						},
					],
				},
			},
		},
	},
})
