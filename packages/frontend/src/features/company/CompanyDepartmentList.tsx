import { Button, TextInput } from "@mantine/core"
import clsx from "clsx"
import { type ChangeEvent, type CSSProperties } from "react"

import { type CompanyDepartment } from "@/shared/company"

import * as classes from "./CompanyDepartmentList.css"
import { CompanyRemoveButton } from "./CompanyRemoveButton"
import { CompanySection } from "./CompanySection"

interface CompanyDepartmentListProps {
	departments: CompanyDepartment[]
	disabled: boolean
	onChange: (departments: CompanyDepartment[]) => void
}

interface DepartmentNameFieldProps {
	department: CompanyDepartment
	disabled: boolean
	row: number
	onNameChange: (departmentId: string, name: string) => void
}

interface DepartmentRemoveButtonProps {
	department: CompanyDepartment
	disabled: boolean
	row: number
	onRemove: (departmentId: string) => void
}

function removeDepartmentLabel(name: string): string {
	const trimmed = name.trim()
	return trimmed ? `Remove ${ trimmed }` : "Remove department"
}

function gridRow(row: number): CSSProperties {
	return { gridRow: row }
}

function DepartmentNameField({
	department,
	disabled,
	row,
	onNameChange,
}: DepartmentNameFieldProps) {
	function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
		onNameChange(department.id, event.currentTarget.value)
	}

	return (
		<TextInput
			className={ clsx(classes.name) }
			style={ gridRow(row) }
			aria-label="Department name"
			placeholder="Name"
			value={ department.name }
			disabled={ disabled }
			onChange={ handleNameChange }
		/>
	)
}

function DepartmentRemoveButton({
	department,
	disabled,
	row,
	onRemove,
}: DepartmentRemoveButtonProps) {
	function handleRemove() {
		onRemove(department.id)
	}

	return (
		<div className={ clsx(classes.remove) } style={ gridRow(row) }>
			<CompanyRemoveButton
				label={ removeDepartmentLabel(department.name) }
				disabled={ disabled }
				onClick={ handleRemove }
			/>
		</div>
	)
}

export function CompanyDepartmentList({
	departments,
	disabled,
	onChange,
}: CompanyDepartmentListProps) {
	function handleNameChange(departmentId: string, name: string) {
		onChange(departments.map((department) => (
			department.id === departmentId ? { ...department, name } : department
		)))
	}

	function handleRemove(departmentId: string) {
		onChange(departments.filter((department) => department.id !== departmentId))
	}

	function handleAdd() {
		onChange([...departments, { id: crypto.randomUUID(), name: "" }])
	}

	return (
		<CompanySection
			title="Departments"
			description="These names are the choices for a user's department."
		>
			{ departments.length > 0
				? (
					<div className={ clsx(classes.rows) }>
						{ departments.map((department, row) => (
							<DepartmentNameField
								key={ department.id }
								department={ department }
								disabled={ disabled }
								row={ row + 1 }
								onNameChange={ handleNameChange }
							/>
						)) }
						{ departments.map((department, row) => (
							<DepartmentRemoveButton
								key={ `${ department.id }-remove` }
								department={ department }
								disabled={ disabled }
								row={ row + 1 }
								onRemove={ handleRemove }
							/>
						)) }
					</div>
				)
				: null }
			<Button variant="default" w="fit-content" disabled={ disabled } onClick={ handleAdd }>
				Add department
			</Button>
		</CompanySection>
	)
}
