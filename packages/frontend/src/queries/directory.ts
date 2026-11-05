import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchAuthorized } from "@/frontend/lib/fetchAuthorized"
import {
	type DirectoryGroup,
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
} from "@/shared/directoryFixtures"
import { type DirectoryGroupUpdate, type DirectoryUserUpdate } from "@/shared/directoryUpdate"

export interface DirectorySnapshot {
	users: DirectoryUser[]
	groups: DirectoryGroup[]
	organizationalUnits: DirectoryOrganizationalUnit[]
}

const DIRECTORY_QUERY_KEY = ["directory"] as const

async function fetchDirectory(): Promise<DirectorySnapshot> {
	const response = await fetchAuthorized("/api/directory")
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
		onSuccess: (snapshot) => {
			queryClient.setQueryData(DIRECTORY_QUERY_KEY, snapshot)
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
