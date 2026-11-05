export function errorMessage(error: unknown, fallback = "Request failed"): string {
	if(error instanceof Error && error.message) return error.message
	return fallback
}
