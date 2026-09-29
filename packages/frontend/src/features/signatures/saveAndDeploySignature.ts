import { type SignatureWizardValues } from "@/frontend/features/signatures/SignatureWizard/types"
import { fetchAuthorized } from "@/frontend/lib/fetchAuthorized"
import { type SaveAndDeployRequest, type SaveAndDeployResponse } from "@/shared/template"

export async function saveAndDeploySignature(
	values: SignatureWizardValues,
	templateId?: string,
): Promise<SaveAndDeployResponse> {
	const body: SaveAndDeployRequest = {
		templateId,
		name: values.name,
		content: values.content,
		isDefault: values.isDefault,
		userEmails: values.userEmails,
		groupIds: values.groupIds,
		organizationalUnitPaths: values.organizationalUnitPaths,
		isScheduled: values.isScheduled,
	}

	const response = await fetchAuthorized("/api/save-and-deploy", {
		method: "POST",
		body: JSON.stringify(body),
	})

	const payload = await response.json() as SaveAndDeployResponse & { error?: string }
	if(!response.ok) {
		throw new Error(payload.error ?? "Failed to save signature")
	}

	return payload
}
