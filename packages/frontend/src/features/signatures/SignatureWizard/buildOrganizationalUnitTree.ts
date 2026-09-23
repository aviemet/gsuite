import { type TreeNodeData } from "@mantine/core"

export interface OrganizationalUnitNode {
	path: string
	name: string
}

export function buildOrganizationalUnitTree(units: OrganizationalUnitNode[]): TreeNodeData[] {
	const nodes = new Map<string, TreeNodeData>()

	const sortedUnits = [...units].sort((left, right) => {
		const leftDepth = left.path === "/" ? 0 : left.path.split("/").filter(Boolean).length
		const rightDepth = right.path === "/" ? 0 : right.path.split("/").filter(Boolean).length
		if(leftDepth !== rightDepth) return leftDepth - rightDepth
		return left.path.localeCompare(right.path)
	})

	for(const unit of sortedUnits) {
		nodes.set(unit.path, {
			value: unit.path,
			label: unit.name,
			children: [],
		})
	}

	const roots: TreeNodeData[] = []

	for(const unit of sortedUnits) {
		const node = nodes.get(unit.path)
		if(!node) continue

		if(unit.path === "/") {
			roots.push(node)
			continue
		}

		const parentPath = unit.path.slice(0, unit.path.lastIndexOf("/")) || "/"
		const parent = nodes.get(parentPath)
		if(parent) {
			parent.children = parent.children ?? []
			parent.children.push(node)
			continue
		}

		roots.push(node)
	}

	return pruneEmptyChildren(roots)
}

function pruneEmptyChildren(nodes: TreeNodeData[]): TreeNodeData[] {
	return nodes.map((node) => {
		const children = node.children && node.children.length > 0
			? pruneEmptyChildren(node.children)
			: undefined
		return children ? { ...node, children } : { value: node.value, label: node.label }
	})
}
