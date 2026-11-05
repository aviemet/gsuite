import { type DirectoryOrganizationalUnit } from "@/shared/directoryFixtures"

export interface OrganizationalUnitSelectRow {
	path: string
	name: string
	depth: number
	hasChildren: boolean
}

function parentOrganizationalUnitPath(path: string): string | null {
	if(path === "/") return null
	const slashIndex = path.lastIndexOf("/")
	if(slashIndex <= 0) return "/"
	return path.slice(0, slashIndex)
}

export function organizationalUnitSelectRows(
	units: readonly DirectoryOrganizationalUnit[],
): OrganizationalUnitSelectRow[] {
	const unitsByPath = new Map(units.map((unit) => [unit.path, unit]))
	const childPaths = new Map<string, string[]>()
	const rootPaths: string[] = []

	for(const unit of units) {
		const parentPath = parentOrganizationalUnitPath(unit.path)
		if(parentPath === null || !unitsByPath.has(parentPath)) {
			rootPaths.push(unit.path)
			continue
		}
		const children = childPaths.get(parentPath) ?? []
		children.push(unit.path)
		childPaths.set(parentPath, children)
	}

	function comparePaths(leftPath: string, rightPath: string): number {
		if(leftPath === "/") return -1
		if(rightPath === "/") return 1
		const leftName = unitsByPath.get(leftPath)?.name ?? leftPath
		const rightName = unitsByPath.get(rightPath)?.name ?? rightPath
		return leftName.localeCompare(rightName)
	}

	const rows: OrganizationalUnitSelectRow[] = []

	function appendBranch(path: string, depth: number) {
		const unit = unitsByPath.get(path)
		if(!unit) return
		const children = [...(childPaths.get(path) ?? [])].sort(comparePaths)
		rows.push({
			path: unit.path,
			name: unit.name,
			depth,
			hasChildren: children.length > 0,
		})
		for(const childPath of children) appendBranch(childPath, depth + 1)
	}

	for(const rootPath of [...rootPaths].sort(comparePaths)) appendBranch(rootPath, 0)
	return rows
}
