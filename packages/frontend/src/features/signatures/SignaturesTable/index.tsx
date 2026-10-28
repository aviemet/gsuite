import { ActionIcon, Badge, Box, Group } from "@mantine/core"
import { IconChevronDown, IconChevronsDown, IconPencil, IconTrash } from "@tabler/icons-react"
import { Link, useRouter } from "@tanstack/react-router"
import clsx from "clsx"
import { DataTable, type DataTableSortStatus } from "mantine-datatable"
import { type MouseEvent, useState } from "react"

import { HtmlPreview } from "@/frontend/components/HtmlPreview"
import { AssignmentSummaryBadge } from "@/frontend/features/signatures/AssignmentSummaryBadge"
import { type TemplateAssignmentSummary } from "@/frontend/features/signatures/summarizeTemplateAssignments"
import { Template } from "@/frontend/types/firebase"
import { safeTemplateParse } from "@/shared/parseTemplate"
import { samplePerson } from "@/shared/person.testdata"
import { getTemplatePreviewContext } from "@/shared/templatePlaceholders"

import { formatTemplateCreatedAt } from "./formatTemplateCreatedAt"
import * as classes from "./SignaturesTable.css"
import { sortSignatureTemplates } from "./sortSignatureTemplates"

interface SignaturesTableProps {
	templates: Template[]
	assignmentSummaries: ReadonlyMap<string, TemplateAssignmentSummary>
	loading: boolean
}

const unassignedSummary: TemplateAssignmentSummary = {
	text: "Unassigned",
	details: [],
	hasDetailTooltip: false,
}

const previewContext = getTemplatePreviewContext(samplePerson)

const defaultSortStatus: DataTableSortStatus<Template> = {
	columnAccessor: "name",
	direction: "asc",
}

export function SignaturesTable({ templates, assignmentSummaries }: SignaturesTableProps) {
	const router = useRouter()
	const [expandedRecordIds, setExpandedRecordIds] = useState<string[]>([])
	const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Template>>(defaultSortStatus)

	const sortedTemplates = sortSignatureTemplates(templates, sortStatus)
	const allExpanded = templates.length > 0
		&& templates.every((template) => expandedRecordIds.includes(template.id))

	function toggleExpanded(recordId: string, event: MouseEvent) {
		event.stopPropagation()
		setExpandedRecordIds((currentIds) => (
			currentIds.includes(recordId)
				? currentIds.filter((id) => id !== recordId)
				: [...currentIds, recordId]
		))
	}

	function toggleExpandAll() {
		setExpandedRecordIds(allExpanded ? [] : templates.map((template) => template.id))
	}

	return (
		<DataTable
			className={ clsx(classes.table) }
			idAccessor="id"
			withTableBorder={ false }
			borderRadius="md"
			withColumnBorders={ false }
			withRowBorders
			highlightOnHover
			records={ sortedTemplates }
			sortStatus={ sortStatus }
			onSortStatusChange={ setSortStatus }
			rowExpansion={ {
				allowMultiple: true,
				trigger: "never",
				expanded: {
					recordIds: expandedRecordIds,
					onRecordIdsChange: setExpandedRecordIds,
				},
				content: ({ record }) => (
					<Box className={ clsx(classes.expansion) }>
						<Box className={ clsx(classes.previewFrame) }>
							<Box className={ clsx(classes.previewContent) }>
								<HtmlPreview html={ safeTemplateParse(record.content, previewContext) } />
							</Box>
						</Box>
					</Box>
				),
			} }
			columns={ [
				{
					accessor: "expand",
					title: (
						<ActionIcon
							variant="subtle"
							color="harbor"
							size="sm"
							aria-label={ allExpanded ? "Collapse all signatures" : "Expand all signatures" }
							aria-expanded={ allExpanded }
							onClick={ toggleExpandAll }
							disabled={ templates.length === 0 }
						>
							<IconChevronsDown
								size={ 16 }
								className={ clsx(
									classes.expandIcon,
									allExpanded && classes.expandIconExpanded,
								) }
							/>
						</ActionIcon>
					),
					width: 44,
					render: (record) => {
						const isExpanded = expandedRecordIds.includes(record.id)
						return (
							<ActionIcon
								variant="subtle"
								color="harbor"
								size="sm"
								aria-label={ isExpanded ? `Collapse ${ record.name }` : `Expand ${ record.name }` }
								aria-expanded={ isExpanded }
								onClick={ (event) => toggleExpanded(record.id, event) }
							>
								<IconChevronDown
									size={ 16 }
									className={ clsx(
										classes.expandIcon,
										isExpanded && classes.expandIconExpanded,
									) }
								/>
							</ActionIcon>
						)
					},
				},
				{
					accessor: "name",
					title: "Name",
					sortable: true,
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
					accessor: "assignedTo",
					title: "Assigned to",
					render: (record) => (
						<AssignmentSummaryBadge
							summary={ assignmentSummaries.get(record.id) ?? unassignedSummary }
						/>
					),
				},
				{
					accessor: "isScheduled",
					title: "Schedule",
					sortable: true,
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
					accessor: "createdAt",
					title: "Created",
					sortable: true,
					noWrap: true,
					render: ({ createdAt }) => formatTemplateCreatedAt(createdAt),
				},
				{
					accessor: "actions",
					title: "Actions",
					width: "0%",
					noWrap: true,
					cellsClassName: classes.actionsCell,
					render: (record) => (
						<Group gap={ 4 } wrap="nowrap">
							<ActionIcon
								variant="subtle"
								color="harbor"
								size="sm"
								aria-label={ `Edit ${ record.name }` }
								onClick={ () => router.navigate({
									to: "/signatures/edit/$id",
									params: { id: record.id },
								}) }
							>
								<IconPencil size={ 16 } aria-hidden />
							</ActionIcon>
							<ActionIcon
								variant="subtle"
								color="red"
								size="sm"
								aria-label={ `Delete ${ record.name }` }
							>
								<IconTrash size={ 16 } aria-hidden />
							</ActionIcon>
						</Group>
					),
				},
			] }
		/>
	)
}
