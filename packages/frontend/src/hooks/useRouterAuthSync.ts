import { useEffect } from "react"

import { router } from "@/frontend/routes"

export function useRouterAuthSync(isLoading: boolean, isAuthenticated: boolean): void {
	useEffect(() => {
		if(isLoading) return

		void router.invalidate()
	}, [isAuthenticated, isLoading])
}
