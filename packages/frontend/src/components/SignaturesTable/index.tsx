import { Badge, Group } from "@mantine/core"
import { Link } from "@tanstack/react-router"
import { DataTable } from "mantine-datatable"

import { Template } from "@/frontend/types/firebase"

interface SignaturesTableProps {
	templates: Template[]
	loading: boolean
}

export const SignaturesTable = ({ templates, loading }: SignaturesTableProps) => {
	return (
		<DataTable
			borderRadius="sm"
			withColumnBorders
			striped
			highlightOnHover
			records={ templates }
			columns={ [
				{
					accessor: "name",
					title: "Name",
					render: (record) => (
						<Link
							to="/signatures/$signatureId"
							params={ { signatureId: record.id } }
							style={ { textDecoration: "none", color: "inherit" } }
						>
							{ record.name }
						</Link>
					),
				},
				{
					accessor: "variables",
					title: "Variables",
					render: ({ variables }) => (
						<Group gap="xs">
							{ variables.map((variable) => (
								<Badge key={ variable } size="sm" variant="light">
									{ variable }
								</Badge>
							)) }
						</Group>
					),
				},
				{
					accessor: "conditions",
					title: "Conditions",
					render: ({ conditions }) => (
						<Group gap="xs">
							{ conditions.map((condition) => (
								<Badge key={ condition } size="sm" variant="light" color="blue">
									{ condition }
								</Badge>
							)) }
						</Group>
					),
				},
				{
					accessor: "isActive",
					title: "Status",
					render: ({ isActive }) => (
						<Badge
							size="sm"
							variant="light"
							color={ isActive ? "green" : "red" }
						>
							{ isActive ? "Active" : "Inactive" }
						</Badge>
					),
				},
				{
					accessor: "createdAt",
					title: "Created",
					render: ({ createdAt }) => createdAt.toDate().toLocaleDateString(),
				},
				{
					accessor: "updatedAt",
					title: "Last Updated",
					render: ({ updatedAt }) => updatedAt.toDate().toLocaleDateString(),
				},
			] }
		/>
	)
}
