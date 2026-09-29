import { readFirebaseProjectId, resolveFirestoreDatabaseId } from "@gsuite/shared"
import { App, cert, getApps, initializeApp } from "firebase-admin/app"
import { Auth, getAuth } from "firebase-admin/auth"
import { Firestore, getFirestore } from "firebase-admin/firestore"

let app: App | undefined

export function getAdminApp(): App {
	if(app) return app
	const existing = getApps()[0]
	if(existing) {
		app = existing
		return app
	}

	const projectId = readFirebaseProjectId(process.env)

	if(process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST) {
		app = initializeApp({ projectId })
		return app
	}

	if(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
		const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) as Record<string, string>
		app = initializeApp({
			credential: cert(serviceAccount),
			projectId,
		})
		return app
	}

	app = initializeApp({ projectId })
	return app
}

export function getAdminAuth(): Auth {
	return getAuth(getAdminApp())
}

export function getAdminFirestore(): Firestore {
	return getFirestore(getAdminApp(), resolveFirestoreDatabaseId(Boolean(process.env.FIRESTORE_EMULATOR_HOST)))
}

export interface AuthenticatedAdmin {
	uid: string
	email: string | undefined
}

export async function verifyAdminToken(authorizationHeader: string | undefined): Promise<AuthenticatedAdmin> {
	if(!authorizationHeader?.startsWith("Bearer ")) {
		throw new Error("Missing bearer token")
	}

	const idToken = authorizationHeader.slice("Bearer ".length).trim()
	if(!idToken) {
		throw new Error("Missing bearer token")
	}

	const decoded = await getAdminAuth().verifyIdToken(idToken)
	if(decoded.admin !== true) {
		throw new Error("Admin access required")
	}

	return {
		uid: decoded.uid,
		email: decoded.email,
	}
}
