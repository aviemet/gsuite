export const FIRESTORE_DATABASE_ID = "default"

export function resolveFirestoreDatabaseId(isEmulator: boolean): string {
	if(isEmulator) return "(default)"
	return FIRESTORE_DATABASE_ID
}

export interface FirebaseProjectEnvironment {
	GCLOUD_PROJECT?: string
	FIREBASE_PROJECT_ID?: string
	VITE_FIREBASE_PROJECT_ID?: string
}

export function readFirebaseProjectId(env: FirebaseProjectEnvironment): string {
	const projectId = env.GCLOUD_PROJECT
		?? env.FIREBASE_PROJECT_ID
		?? env.VITE_FIREBASE_PROJECT_ID
	if(!projectId) {
		throw new Error("Missing Firebase project id. Set GCLOUD_PROJECT or VITE_FIREBASE_PROJECT_ID.")
	}

	return projectId
}
