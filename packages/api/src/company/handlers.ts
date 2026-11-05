import { getAdminFirestore } from "../firebase/admin"
import { ok, withMemberAuth } from "../http"
import { requireAccessManager } from "../workspace/authorize"
import { parseCompanyProfile } from "./parseCompanyProfile"
import { readCompany } from "./readCompany"
import { saveCompany } from "./saveCompany"

export const readCompanyHandler = withMemberAuth(async ({ member }) => {
	const record = await readCompany(member.customerId, {
		db: getAdminFirestore(),
	})
	return ok(record)
})

export const saveCompanyHandler = withMemberAuth(async ({ member, body }) => {
	requireAccessManager(member)
	const profile = parseCompanyProfile(body, () => crypto.randomUUID())
	const record = await saveCompany(profile, member, {
		db: getAdminFirestore(),
	})
	return ok(record)
})
