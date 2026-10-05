import { useCallback, useEffect } from "react"

import { useApiStatus } from "@/frontend/queries/workspace"

import { notifySettingsError } from "../notifySettingsError"

export function useAutomaticApiStatus(userEmail: string | undefined) {
	const apiStatus = useApiStatus()
	const { mutate } = apiStatus

	const check = useCallback((email: string) => {
		mutate(email, {
			onError: (error) => notifySettingsError(error, "Failed to check Google APIs"),
		})
	}, [mutate])

	useEffect(() => {
		if(!userEmail) return
		check(userEmail)
	}, [userEmail, check])

	return {
		...apiStatus,
		check,
	}
}
