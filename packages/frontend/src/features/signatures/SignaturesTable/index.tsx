import { Badge, Button, Group } from "@mantine/core"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { Link, useRouter } from "@tanstack/react-router"
import { DataTable } from "mantine-datatable"

import { Template } from "@/frontend/types/firebase"

interface SignaturesTableProps {
	templates: Template[]
	loading: boolean
}

export function SignaturesTable({ templates }: SignaturesTableProps) {
	const router = useRouter()

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
							<Button
								variant="subtle"
								size="xs"
								aria-label={ `Edit ${ record.name }` }
								onClick={ () => router.navigate({
									to: "/signatures/edit/$id",
									params: { id: record.id },
								}) }
							>
								<IconPencil size={ 16 } aria-hidden />
							</Button>
							<Button
								variant="subtle"
								size="xs"
								color="red"
								aria-label={ `Delete ${ record.name }` }
							>
								<IconTrash size={ 16 } aria-hidden />
							</Button>
						</Group>
					),
				},
			] }
		/>
	)
}
