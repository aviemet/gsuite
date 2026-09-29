import {
	GoogleAuthProvider,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	type User,
} from "firebase/auth"

import { getFirebaseAuth } from "@/frontend/lib/firebase"

const googleProvider = new GoogleAuthProvider()

const authErrorMessages: Record<string, string> = {
	"auth/invalid-credential": "Invalid email or password",
	"auth/wrong-password": "Invalid email or password",
	"auth/user-not-found": "Invalid email or password",
	"auth/invalid-email": "Enter a valid email address",
	"auth/too-many-requests": "Too many attempts. Try again later",
	"auth/popup-closed-by-user": "Sign-in was cancelled",
	"auth/popup-blocked": "Pop-up was blocked. Allow pop-ups and try again",
	"auth/network-request-failed": "Network error. Check your connection and try again",
}

export function getAuthErrorMessage(error: unknown): string {
	if(error && typeof error === "object" && "code" in error && typeof error.code === "string") {
		const message = authErrorMessages[error.code]
		if(message) return message
	}

	return "Something went wrong. Please try again"
}

export function sanitizeRedirectPath(value: unknown): string {
	if(typeof value !== "string") return "/"
	if(!value.startsWith("/") || value.startsWith("//")) return "/"
	return value
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
	const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
	return credential.user
}

export async function signInWithGoogle(): Promise<User> {
	const credential = await signInWithPopup(getFirebaseAuth(), googleProvider)
	return credential.user
}

export async function signOutCurrentUser(): Promise<void> {
	await signOut(getFirebaseAuth())
}
