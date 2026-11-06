import { type QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchAuthorized } from "@/frontend/lib/fetchAuthorized"
import {
	type DirectoryGroup,
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
} from "@/shared/directoryFixtures"
import {
	type DirectoryGroupUpdate,
	type DirectoryGroupUpdateRequest,
	type DirectoryUserUpdate,
	type DirectoryUserUpdateRequest,
} from "@/shared/directoryUpdate"

import { applyDirectoryUpdate, mergeSavedDirectoryUser } from "./applyDirectoryUpdate"

export interface DirectorySnapshot {
	users: DirectoryUser[]
	groups: DirectoryGroup[]
	organizationalUnits: DirectoryOrganizationalUnit[]
}

const DIRECTORY_QUERY_KEY = ["directory"] as const

async function fetchDirectory(context?: { signal?: AbortSignal }): Promise<DirectorySnapshot> {
	const response = await fetchAuthorized("/api/directory", { signal: context?.signal })
	const payload = await response.json() as DirectorySnapshot & { error?: string }
	if(!response.ok) {
		throw new Error(payload.error ?? "Failed to load directory")
	}
	return payload
}

export { fetchDirectory }

export function useDirectoryQuery(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: DIRECTORY_QUERY_KEY,
		queryFn: fetchDirectory,
		enabled: options?.enabled ?? true,
		staleTime: 1000 * 60 * 5,
	})
}

async function postDirectoryRecord<TRecord>(
	path: string,
	body: DirectoryUserUpdateRequest | DirectoryGroupUpdateRequest,
	fallback: string,
): Promise<TRecord> {
	const response = await fetchAuthorized(path, {
		method: "POST",
		body: JSON.stringify(body),
	})
	const payload = await response.json() as TRecord & { error?: string }
	if(!response.ok) {
		throw new Error(payload.error ?? fallback)
	}
	return payload
}

async function beginDirectoryUpdate(
	queryClient: QueryClient,
	update: DirectoryUserUpdate | DirectoryGroupUpdate,
): Promise<{ previous: DirectorySnapshot | undefined }> {
	await queryClient.cancelQueries({ queryKey: DIRECTORY_QUERY_KEY })
	const previous = queryClient.getQueryData<DirectorySnapshot>(DIRECTORY_QUERY_KEY)
	if(previous) {
		queryClient.setQueryData(DIRECTORY_QUERY_KEY, applyDirectoryUpdate(previous, update))
	}
	return { previous }
}

function restoreDirectory(
	queryClient: QueryClient,
	context: { previous: DirectorySnapshot | undefined } | undefined,
): void {
	if(context?.previous) {
		queryClient.setQueryData(DIRECTORY_QUERY_KEY, context.previous)
	}
}

export function useUpdateDirectoryUser() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (body: DirectoryUserUpdateRequest) => postDirectoryRecord<DirectoryUser>(
			"/api/directory/users/update",
			body,
			"Failed to update user",
		),
		onMutate: (body) => beginDirectoryUpdate(queryClient, body.next),
		onError: (_error, _body, context) => {
			restoreDirectory(queryClient, context)
		},
		onSuccess: (user) => {
			queryClient.setQueryData<DirectorySnapshot>(DIRECTORY_QUERY_KEY, (current) => (
				current ? mergeSavedDirectoryUser(current, user) : current
			))
		},
	})
}

export function useUpdateDirectoryGroup() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (body: DirectoryGroupUpdateRequest) => postDirectoryRecord<DirectoryGroup>(
			"/api/directory/groups/update",
			body,
			"Failed to update group",
		),
		onMutate: (body) => beginDirectoryUpdate(queryClient, body.next),
		onError: (_error, _body, context) => {
			restoreDirectory(queryClient, context)
		},
		onSuccess: (group) => {
			queryClient.setQueryData<DirectorySnapshot>(DIRECTORY_QUERY_KEY, (current) => (
				current
					? applyDirectoryUpdate(current, {
						id: group.id,
						name: group.name,
						email: group.email,
						description: group.description,
						members: group.members,
					})
					: current
			))
		},
	})
}
