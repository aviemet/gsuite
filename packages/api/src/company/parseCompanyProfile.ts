import { type CompanyProfile, readCompanyProfile } from "@gsuite/shared"

import { HttpError } from "../http/errors"

export function parseCompanyProfile(body: unknown, createId: () => string): CompanyProfile {
	try {
		return readCompanyProfile(body, createId)
	} catch (error) {
		const message = error instanceof Error ? error.message : "Invalid company"
		throw new HttpError(message, 400)
	}
}
