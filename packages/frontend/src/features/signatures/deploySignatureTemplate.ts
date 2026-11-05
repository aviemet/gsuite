import { fetchAuthorized } from "@/frontend/lib/fetchAuthorized"
import { type DeployTemplateRequest, type DeployTemplateResponse } from "@/shared/template"

export async function deploySignatureTemplate(
	templateId: string,
): Promise<DeployTemplateResponse> {
	const body: DeployTemplateRequest = { templateId }

	const response = await fetchAuthorized("/api/deploy-template", {
		method: "POST",
		body: JSON.stringify(body),
	})

	const payload = await response.json() as DeployTemplateResponse & { error?: string }
	if(!response.ok) {
		throw new Error(payload.error ?? "Failed to deploy signature")
	}

	return payload
}
