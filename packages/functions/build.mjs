import path from "node:path"
import { fileURLToPath } from "node:url"

import { build, context } from "esbuild"

const packageDirectory = path.dirname(fileURLToPath(import.meta.url))

const options = {
	entryPoints: ["src/index.ts"],
	bundle: true,
	platform: "node",
	target: "node22",
	format: "cjs",
	outfile: "lib/index.js",
	sourcemap: true,
	absWorkingDir: packageDirectory,
	alias: {
		"@gsuite/api": path.join(packageDirectory, "../api/src/index.ts"),
		"@gsuite/shared": path.join(packageDirectory, "../shared/src/index.ts"),
	},
	external: [
		"firebase-admin",
		"firebase-admin/*",
		"firebase-functions",
		"firebase-functions/*",
	],
}

if(process.argv.includes("--watch")) {
	const buildContext = await context(options)
	await buildContext.watch()
} else {
	await build(options)
}
