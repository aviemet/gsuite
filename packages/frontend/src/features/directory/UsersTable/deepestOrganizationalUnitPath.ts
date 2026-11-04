export function deepestOrganizationalUnitPath(paths: readonly string[]): string {
	if(paths.length === 0) return ""

	return paths.reduce((deepest, path) => {
		const deepestDepth = deepest.split("/").filter(Boolean).length
		const pathDepth = path.split("/").filter(Boolean).length
		return pathDepth > deepestDepth ? path : deepest
	})
}
