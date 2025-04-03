import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"

import { FirebaseConfig } from "../types/firebase"

const firebaseConfig: FirebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp
let db: Firestore
let auth: Auth

export const initializeFirebase = (): void => {
	if(!getApps().length) {
		app = initializeApp(firebaseConfig)
		db = getFirestore(app)
		auth = getAuth(app)
	}
}

export const getFirebaseApp = (): FirebaseApp => {
	if(!app) {
		initializeFirebase()
	}
	return app
}

export const getFirebaseDb = (): Firestore => {
	if(!db) {
		initializeFirebase()
	}
	return db
}

export const getFirebaseAuth = (): Auth => {
	if(!auth) {
		initializeFirebase()
	}
	return auth
}
