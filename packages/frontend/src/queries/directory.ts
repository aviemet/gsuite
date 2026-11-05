import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchAuthorized } from "@/frontend/lib/fetchAuthorized"
import {
	type DirectoryGroup,
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
} from "@/shared/directoryFixtures"
import { type DirectoryGroupUpdate, type DirectoryUserUpdate } from "@/shared/directoryUpdate"

import { applyDirectoryUpdate } from "./applyDirectoryUpdate"

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

async function postDirectoryUpdate(
	path: string,
	body: DirectoryUserUpdate | DirectoryGroupUpdate,
	fallback: string,
): Promise<DirectorySnapshot> {
	const response = await fetchAuthorized(path, {
		method: "POST",
		body: JSON.stringify(body),
	})
	const payload = await response.json() as DirectorySnapshot & { error?: string }
	if(!response.ok) {
		throw new Error(payload.error ?? fallback)
	}
	return payload
}

function useDirectoryUpdateMutation<TBody extends DirectoryUserUpdate | DirectoryGroupUpdate>(
	path: string,
	fallback: string,
) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (body: TBody) => postDirectoryUpdate(path, body, fallback),
		onMutate: async (body) => {
			await queryClient.cancelQueries({ queryKey: DIRECTORY_QUERY_KEY })
			const previous = queryClient.getQueryData<DirectorySnapshot>(DIRECTORY_QUERY_KEY)
			if(previous) {
				queryClient.setQueryData(DIRECTORY_QUERY_KEY, applyDirectoryUpdate(previous, body))
			}
			return { previous }
		},
		onError: (_error, _body, context) => {
			if(context?.previous) {
				queryClient.setQueryData(DIRECTORY_QUERY_KEY, context.previous)
			}
		},
		onSuccess: (snapshot, body) => {
			queryClient.setQueryData(DIRECTORY_QUERY_KEY, applyDirectoryUpdate(snapshot, body))
		},
	})
}

export function useUpdateDirectoryUser() {
	return useDirectoryUpdateMutation<DirectoryUserUpdate>(
		"/api/directory/users/update",
		"Failed to update user",
	)
}

export function useUpdateDirectoryGroup() {
	return useDirectoryUpdateMutation<DirectoryGroupUpdate>(
		"/api/directory/groups/update",
		"Failed to update group",
	)
}
