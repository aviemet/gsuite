export const membershipRoles = {
	superAdmin: "superAdmin",
	admin: "admin",
	editor: "editor",
	viewer: "viewer",
} as const

export type MembershipRole = typeof membershipRoles[keyof typeof membershipRoles]

export const membershipRoleLabels: Record<MembershipRole, string> = {
	superAdmin: "Super admin",
	admin: "Admin",
	editor: "Editor",
	viewer: "View only",
}

export const CUSTOMERS_COLLECTION = "customers"
export const MEMBERSHIPS_COLLECTION = "memberships"
export const ACCESS_COLLECTION = "accessByEmail"

export const SEED_CUSTOMER_ID = "example-corp"
export const SEED_USER_EMAIL = "test@test.com"
export const SEED_WORKSPACE_ADMIN_EMAIL = "jane.doe@example.com"
export const SEED_PRIMARY_DOMAIN = "example.com"

export const directoryUserScope = "https://www.googleapis.com/auth/admin.directory.user"
export const directoryGroupScope = "https://www.googleapis.com/auth/admin.directory.group"
export const directoryGroupMemberScope = "https://www.googleapis.com/auth/admin.directory.group.member"
export const directoryOrgUnitScope = "https://www.googleapis.com/auth/admin.directory.orgunit"
export const gmailSettingsScope = "https://www.googleapis.com/auth/gmail.settings.basic"

export const workspaceScopes = [
	directoryUserScope,
	directoryGroupScope,
	directoryGroupMemberScope,
	directoryOrgUnitScope,
	gmailSettingsScope,
] as const

export const directoryScopes = [
	directoryUserScope,
	directoryGroupScope,
	directoryGroupMemberScope,
	directoryOrgUnitScope,
] as const

export const WORKSPACE_NOT_INSTALLED_MESSAGE
	= "Google has not finished installing the app for your Workspace. Install it from the Google Workspace Marketplace, wait a few minutes, then try Connect again."

export function isWorkspaceNotInstalledMessage(message: string): boolean {
	return message === WORKSPACE_NOT_INSTALLED_MESSAGE
		|| message.toLowerCase().includes("domain-wide delegation")
		|| message.toLowerCase().includes("marketplace")
}

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

export interface AccessRecord {
	email: string
	role: MembershipRole
	createdAt: string
	uid: string | null
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
	groupMembers: "groupMembers",
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
	return value === membershipRoles.superAdmin
		|| value === membershipRoles.admin
		|| value === membershipRoles.editor
		|| value === membershipRoles.viewer
}

export function normalizeMembershipRole(value: unknown): MembershipRole | undefined {
	if(isMembershipRole(value)) return value
	if(value === "owner") return membershipRoles.superAdmin
	if(value === "member") return membershipRoles.editor
	return undefined
}

export function canManageAccess(role: MembershipRole): boolean {
	return role === membershipRoles.superAdmin || role === membershipRoles.admin
}

export function canEditSignatures(role: MembershipRole): boolean {
	return role === membershipRoles.superAdmin
		|| role === membershipRoles.admin
		|| role === membershipRoles.editor
}

export function canManageWorkspaceSettings(role: MembershipRole): boolean {
	return role === membershipRoles.superAdmin
}
