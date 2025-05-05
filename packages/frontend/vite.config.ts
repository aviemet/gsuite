import path from "path"
import react from "@vitejs/plugin-react"
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
		},
	},
})
