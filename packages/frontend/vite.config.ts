import path from "path"
// import react from "@vitejs/plugin-react" // Old plugin
import react from "@vitejs/plugin-react-swc" // New SWC-based plugin
import wyw from "@wyw-in-js/vite"
import { defineConfig } from "vite"

export default defineConfig({
	plugins: [
		react(),
		wyw({
			include: ["src/**/*.{ts,tsx}"],
			babelOptions: {
				presets: [
					"@babel/preset-typescript",
					"@babel/preset-react",
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@/frontend": path.resolve(__dirname, "./src"),
			"@/shared": path.resolve(__dirname, "../shared/src"),
			"@/functions": path.resolve(__dirname, "../functions/src"),
		},
		dedupe: [
			"react",
			"react-dom",
		],
	},
	optimizeDeps: {
		entries: [
			"src/main.tsx",
		],
		include: [
			"@codemirror/state",
			"@codemirror/view",
			"@codemirror/lang-html",
			"js-beautify",
		],
	},
})
