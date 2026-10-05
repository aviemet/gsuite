import path from "node:path"

import { defineConfig } from "vitest/config"

export default defineConfig({
	resolve: {
		alias: {
			"@gsuite/shared": path.resolve(import.meta.dirname, "../shared/src/index.ts"),
		},
	},
	test: {
		environment: "node",
		include: ["tests/**/*.{test,spec}.ts"],
	},
})
