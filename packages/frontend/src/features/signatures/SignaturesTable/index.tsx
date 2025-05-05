import { Badge, Group, Button } from "@mantine/core"
import { IconPencil, IconTrash } from "@tabler/icons-react"
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
			withTableBorder={ false }
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
				{
					accessor: "actions",
					title: "Actions",
					render: (record) => (
						<Group gap="xs">
							<Link
								to="/signatures/edit/$id"
								params={ { id: record.id } }
								style={ { textDecoration: "none" } }
							>
								<Button
									variant="subtle"
									size="xs"
								>
									<IconPencil size={ 16 } />
								</Button>
							</Link>
							<Button
								variant="subtle"
								size="xs"
								color="red"
							>
								<IconTrash size={ 16 } />
							</Button>
						</Group>
					),
				},
			] }
		/>
	)
}
