import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchAuthorized } from "@/frontend/lib/fetchAuthorized"
import {
	type ApiStatusResult,
	type CustomerInvite,
	type CustomerRecord,
	type MembershipRecord,
} from "@/shared/workspace"

export interface WorkspaceSession {
	clientId: string
	scopes: readonly string[]
	customer: CustomerRecord | null
	membership: MembershipRecord | null
	members: MembershipRecord[]
	invites: CustomerInvite[]
}

function hasKey(value: object, key: string): boolean {
	return Object.prototype.hasOwnProperty.call(value, key)
}

function readString(value: object, key: string): string | undefined {
	if(!hasKey(value, key)) return undefined
	const field = Reflect.get(value, key)
	if(typeof field !== "string") return undefined
	return field
}

function errorMessage(value: unknown, fallback: string): string {
	if(!value || typeof value !== "object") return fallback
	const message = readString(value, "error")
	return message ?? fallback
}

async function postWorkspace<T>(path: string, body: object, fallback: string): Promise<T> {
	const response = await fetchAuthorized(path, {
		method: "POST",
		body: JSON.stringify(body),
	})
	const payload: unknown = await response.json()
	if(!response.ok) throw new Error(errorMessage(payload, fallback))
	return payload as T
}

export async function fetchWorkspace(): Promise<WorkspaceSession> {
	const response = await fetchAuthorized("/api/workspace")
	const payload: unknown = await response.json()
	if(!response.ok) throw new Error(errorMessage(payload, "Failed to load Workspace settings"))
	if(!payload || typeof payload !== "object") {
		throw new Error("Failed to load Workspace settings")
	}
	const clientId = readString(payload, "clientId") ?? ""
	const scopes = hasKey(payload, "scopes") && Array.isArray(Reflect.get(payload, "scopes"))
		? Reflect.get(payload, "scopes").filter((scope: unknown): scope is string => typeof scope === "string")
		: []
	const customer = hasKey(payload, "customer") ? Reflect.get(payload, "customer") : null
	const membership = hasKey(payload, "membership") ? Reflect.get(payload, "membership") : null
	const members = hasKey(payload, "members") && Array.isArray(Reflect.get(payload, "members"))
		? Reflect.get(payload, "members") as MembershipRecord[]
		: []
	const invites = hasKey(payload, "invites") && Array.isArray(Reflect.get(payload, "invites"))
		? Reflect.get(payload, "invites") as CustomerInvite[]
		: []
	return {
		clientId,
		scopes,
		customer: customer && typeof customer === "object" ? customer as CustomerRecord : null,
		membership: membership && typeof membership === "object" ? membership as MembershipRecord : null,
		members,
		invites,
	}
}

export function useWorkspaceQuery() {
	return useQuery({
		queryKey: ["workspace"],
		queryFn: fetchWorkspace,
	})
}

function useWorkspaceMutation<TBody extends object, TResult>(
	path: string,
	fallback: string,
) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (body: TBody) => postWorkspace<TResult>(path, body, fallback),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["workspace"] })
			await queryClient.invalidateQueries({ queryKey: ["membership"] })
		},
	})
}

export function useConnectWorkspace() {
	return useWorkspaceMutation<{ workspaceAdminEmail: string }, CustomerRecord>(
		"/api/workspace/connect",
		"Failed to connect Workspace",
	)
}

export function useSetWorkspaceAdmin() {
	return useWorkspaceMutation<{ workspaceAdminEmail: string }, CustomerRecord>(
		"/api/workspace/admin",
		"Failed to update the Workspace admin",
	)
}

export function useInviteMember() {
	return useWorkspaceMutation<{ email: string }, CustomerInvite>(
		"/api/workspace/invites",
		"Failed to invite member",
	)
}

export function useRemoveMember() {
	return useWorkspaceMutation<{ uid: string }, { ok: true }>(
		"/api/workspace/members/remove",
		"Failed to remove member",
	)
}

export function useAcceptInvite() {
	return useWorkspaceMutation<Record<string, never>, MembershipRecord>(
		"/api/workspace/invites/accept",
		"Invite not found",
	)
}

export function useApiStatus() {
	return useMutation({
		mutationFn: (userEmail: string) => postWorkspace<{ results: ApiStatusResult[] }>(
			"/api/workspace/api-status",
			{ userEmail },
			"Failed to check Google APIs",
		),
	})
}
