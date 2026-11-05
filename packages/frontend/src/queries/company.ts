import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchAuthorized } from "@/frontend/lib/fetchAuthorized"
import { type CompanyProfile, type CompanyRecord, readCompanyRecord } from "@/shared/company"

const COMPANY_QUERY_KEY = ["company"] as const

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

async function readCompanyPayload(response: Response, fallback: string): Promise<CompanyRecord> {
	const payload: unknown = await response.json()
	if(!response.ok) throw new Error(errorMessage(payload, fallback))
	try {
		return readCompanyRecord(payload, () => crypto.randomUUID())
	} catch (error) {
		const message = error instanceof Error ? error.message : fallback
		throw new Error(message)
	}
}

export async function fetchCompany(): Promise<CompanyRecord> {
	const response = await fetchAuthorized("/api/company")
	return readCompanyPayload(response, "Failed to load company")
}

export function useCompanyQuery() {
	return useQuery({
		queryKey: COMPANY_QUERY_KEY,
		queryFn: fetchCompany,
	})
}

export function useSaveCompany() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (profile: CompanyProfile) => {
			const response = await fetchAuthorized("/api/company", {
				method: "POST",
				body: JSON.stringify(profile),
			})
			return readCompanyPayload(response, "Failed to save company")
		},
		onSuccess: async (record) => {
			queryClient.setQueryData(COMPANY_QUERY_KEY, record)
		},
	})
}
