import { fetchAuthorized } from "@/frontend/lib/fetchAuthorized"
import { type SaveTemplateRequest, type SaveTemplateResponse } from "@/shared/template"

export async function saveTemplate(
	values: SaveTemplateRequest,
): Promise<SaveTemplateResponse> {
	const response = await fetchAuthorized("/api/templates", {
		method: "POST",
		body: JSON.stringify(values),
	})

	const payload = await response.json() as SaveTemplateResponse & { error?: string }
	if(!response.ok) {
		throw new Error(payload.error ?? "Failed to save signature")
	}

	return payload
}
