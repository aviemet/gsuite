import { useQuery } from "@tanstack/react-query"

import { fetchAuthorized } from "@/frontend/lib/fetchAuthorized"
import {
	type DirectoryGroup,
	type DirectoryOrganizationalUnit,
	type DirectoryUser,
} from "@/shared/directoryFixtures"

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
