import { getFirebaseAuth } from "@/frontend/lib/firebase"

export async function fetchAuthorized(
	input: string,
	init: RequestInit = {},
): Promise<Response> {
	const auth = getFirebaseAuth()
	const currentUser = auth.currentUser
	if(!currentUser) {
		throw new Error("You must be signed in")
	}

	const idToken = await currentUser.getIdToken()
	const headers = new Headers(init.headers)
	headers.set("Authorization", `Bearer ${idToken}`)
	if(init.body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json")
	}

	return fetch(input, {
		...init,
		headers,
	})
}
