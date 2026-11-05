import { type TemplateAssignment } from "@/frontend/types/firebase"
import { assignmentTypes } from "@/shared/template"

const deployableAssignmentTypes = new Set<string>([
	assignmentTypes.user,
	assignmentTypes.group,
	assignmentTypes.organizationalUnit,
])

export function canDeployTemplate(
	template: { isDefault?: boolean } | undefined,
	assignments: readonly Pick<TemplateAssignment, "templateId" | "assignmentType" | "isActive">[],
	templateId: string,
): boolean {
	if(!template) return false
	if(template.isDefault === true) return true
	return assignments.some((assignment) => (
		assignment.isActive
		&& assignment.templateId === templateId
		&& deployableAssignmentTypes.has(assignment.assignmentType)
	))
}
