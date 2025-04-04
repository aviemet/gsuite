import breakpoints from "./packages/frontend/src/lib/breakpoints.mjs"

const postCssBreakpoints = {}
for(const key in breakpoints) {
	postCssBreakpoints[`mantine-breakpoints-${key}`] = String(breakpoints[key])
}

export default {
	plugins: {
		"postcss-preset-mantine": {},
		"postcss-simple-vars": {
			variables: postCssBreakpoints,
		},
	},
}
