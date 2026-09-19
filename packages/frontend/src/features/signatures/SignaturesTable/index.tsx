import { Badge, Group, Button } from "@mantine/core"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import { DataTable } from "mantine-datatable"

import { Template } from "@/frontend/types/firebase"

interface SignaturesTableProps {
	templates: Template[]
	loading: boolean
}

export function SignaturesTable({ templates }: SignaturesTableProps) {
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
							to="/signatures/edit/$id"
							params={ { id: record.id } }
							style={ { textDecoration: "none", color: "inherit" } }
						>
							{ record.name }
						</Link>
					),
				},
				{
					accessor: "assignedGroup",
					title: "Group",
					render: ({ assignedGroup }) => {
						const groupName = assignedGroup?.trim() || "Unassigned"
						return (
							<Badge
								size="sm"
								variant="light"
								color={ groupName === "Unassigned" ? "gray" : "blue" }
							>
								{ groupName }
							</Badge>
						)
					},
				},
				{
					accessor: "isScheduled",
					title: "Schedule",
					render: ({ isScheduled }) => (
						<Badge
							size="sm"
							variant="light"
							color={ isScheduled ? "violet" : "gray" }
						>
							{ isScheduled ? "Scheduled" : "Not scheduled" }
						</Badge>
					),
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
