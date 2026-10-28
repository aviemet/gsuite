import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchAuthorized } from "@/frontend/lib/fetchAuthorized"
import {
	type AccessRecord,
	type ApiStatusResult,
	type CustomerRecord,
	type MembershipRecord,
	type MembershipRole,
} from "@/shared/workspace"

export interface WorkspaceSession {
	clientId: string
	scopes: readonly string[]
	customer: CustomerRecord | null
	membership: MembershipRecord | null
	access: AccessRecord[]
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
	const access = hasKey(payload, "access") && Array.isArray(Reflect.get(payload, "access"))
		? Reflect.get(payload, "access") as AccessRecord[]
		: []
	return {
		clientId,
		scopes,
		customer: customer && typeof customer === "object" ? customer as CustomerRecord : null,
		membership: membership && typeof membership === "object" ? membership as MembershipRecord : null,
		access,
	}
}

export function useWorkspaceQuery(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: ["workspace"],
		queryFn: fetchWorkspace,
		enabled: options?.enabled ?? true,
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

export function useSetAccess() {
	return useWorkspaceMutation<{ email: string, role: MembershipRole }, AccessRecord>(
		"/api/workspace/access",
		"Failed to update access",
	)
}

export function useRemoveAccess() {
	return useWorkspaceMutation<{ email: string }, { ok: true }>(
		"/api/workspace/access/remove",
		"Failed to remove access",
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
