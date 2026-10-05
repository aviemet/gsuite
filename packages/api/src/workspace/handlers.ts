import { createDirectoryClient } from "../directory"
import { getAdminFirestore } from "../firebase/admin"
import { createGmailClient } from "../gmail"
import { HttpError, ok, withMemberAuth, withSignedInAuth } from "../http"
import { checkApiStatus } from "./apiStatus"
import { requireOwner } from "./authorize"
import { connectWorkspace, setWorkspaceAdmin } from "./connect"
import { acceptInvite, inviteMember, removeMember } from "./invites"
import { loadWorkspaceSession } from "./session"

function readStringField(body: unknown, key: string): string | undefined {
	if(!body || typeof body !== "object" || !Object.hasOwn(body, key)) return undefined
	const value = Reflect.get(body, key)
	if(typeof value !== "string") return undefined
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : undefined
}

function requireEmail(body: unknown, key: string): string {
	const email = readStringField(body, key)?.toLowerCase()
	if(!email || !email.includes("@")) throw new HttpError("Enter an email address", 400)
	return email
}

export const workspaceSessionHandler = withSignedInAuth(async ({ user }) => {
	const session = await loadWorkspaceSession(getAdminFirestore(), user)
	return ok(session)
})

export const connectWorkspaceHandler = withSignedInAuth(async ({ user, body }) => {
	const workspaceAdminEmail = requireEmail(body, "workspaceAdminEmail")
	const customer = await connectWorkspace(getAdminFirestore(), user, workspaceAdminEmail, {
		createDirectory: (subjectEmail) => createDirectoryClient(subjectEmail),
	})
	return ok(customer)
})

export const setWorkspaceAdminHandler = withMemberAuth(async ({ member, body }) => {
	requireOwner(member)
	const workspaceAdminEmail = requireEmail(body, "workspaceAdminEmail")
	const customer = await setWorkspaceAdmin(getAdminFirestore(), member, workspaceAdminEmail, {
		createDirectory: (subjectEmail) => createDirectoryClient(subjectEmail),
	})
	return ok(customer)
})

export const apiStatusHandler = withMemberAuth(async ({ member, body }) => {
	const userEmail = readStringField(body, "userEmail")?.toLowerCase() ?? member.workspaceAdminEmail
	const results = await checkApiStatus(
		createDirectoryClient(member.workspaceAdminEmail),
		createGmailClient(),
		userEmail,
	)
	return ok({ results })
})

export const inviteMemberHandler = withMemberAuth(async ({ member, body }) => {
	requireOwner(member)
	const email = requireEmail(body, "email")
	const invite = await inviteMember(getAdminFirestore(), member, email)
	return ok(invite)
})

export const acceptInviteHandler = withSignedInAuth(async ({ user }) => {
	const membership = await acceptInvite(getAdminFirestore(), user)
	return ok(membership)
})

export const removeMemberHandler = withMemberAuth(async ({ member, body }) => {
	requireOwner(member)
	const uid = readStringField(body, "uid")
	if(!uid) throw new HttpError("Member not found", 400)
	await removeMember(getAdminFirestore(), member, uid)
	return ok({ ok: true })
})
