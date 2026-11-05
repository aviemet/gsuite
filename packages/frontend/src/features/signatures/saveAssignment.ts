import { fetchAuthorized } from "@/frontend/lib/fetchAuthorized"
import { type SaveAssignmentRequest, type SaveAssignmentResponse } from "@/shared/template"

export async function saveAssignment(
	values: SaveAssignmentRequest,
): Promise<SaveAssignmentResponse> {
	const response = await fetchAuthorized("/api/template-assignment", {
		method: "POST",
		body: JSON.stringify(values),
	})

	const payload = await response.json() as SaveAssignmentResponse & { error?: string }
	if(!response.ok) {
		throw new Error(payload.error ?? "Failed to save assignment")
	}

	return payload
}
