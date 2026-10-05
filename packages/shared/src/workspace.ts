export const membershipRoles = {
	owner: "owner",
	member: "member",
} as const

export type MembershipRole = typeof membershipRoles[keyof typeof membershipRoles]

export const CUSTOMERS_COLLECTION = "customers"
export const MEMBERSHIPS_COLLECTION = "memberships"
export const INVITES_COLLECTION = "invites"

export const SEED_CUSTOMER_ID = "example-corp"
export const SEED_USER_EMAIL = "test@test.com"
export const SEED_WORKSPACE_ADMIN_EMAIL = "jane.doe@example.com"
export const SEED_PRIMARY_DOMAIN = "example.com"

export const workspaceScopes = [
	"https://www.googleapis.com/auth/admin.directory.user.readonly",
	"https://www.googleapis.com/auth/admin.directory.group.readonly",
	"https://www.googleapis.com/auth/admin.directory.orgunit.readonly",
	"https://www.googleapis.com/auth/gmail.settings.basic",
] as const

export const directoryScopes = [
	workspaceScopes[0],
	workspaceScopes[1],
	workspaceScopes[2],
] as const

export const gmailSettingsScope = workspaceScopes[3]

export interface CustomerRecord {
	id: string
	primaryDomain: string
	workspaceAdminEmail: string
	createdAt: string
	updatedAt: string
}

export interface MembershipRecord {
	uid: string
	customerId: string
	role: MembershipRole
	email: string
	createdAt: string
}

export interface CustomerInvite {
	email: string
	createdAt: string
}

export interface DirectoryAccount {
	email: string
	displayName: string
	isAdmin: boolean
	primaryDomain: string
}

export const apiStatusCheckIds = {
	users: "users",
	groups: "groups",
	organizationalUnits: "organizationalUnits",
	gmailSettings: "gmailSettings",
} as const

export type ApiStatusCheckId = typeof apiStatusCheckIds[keyof typeof apiStatusCheckIds]

export type ApiStatusGroup = "admin" | "user"

export interface ApiStatusResult {
	id: ApiStatusCheckId
	label: string
	group: ApiStatusGroup
	status: "success" | "error"
	error?: string
}

export function isMembershipRole(value: unknown): value is MembershipRole {
	return value === membershipRoles.owner || value === membershipRoles.member
}
