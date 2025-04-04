module.exports = {
	displayName: true,
	"classNameSlug": (hash, title) => {
		const kebabCase = title.replace(/([a-z])([A-Z])/g, "$1-$2")
			.replace(/[\s_]+/g, "-")
			.toLowerCase()

		return `${kebabCase}__${hash}`
	},
}
