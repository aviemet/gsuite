import { onAuthStateChanged, type User } from "firebase/auth"
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react"

import {
	getAuthErrorMessage,
	signInWithEmail,
	signInWithGoogle,
	signOutCurrentUser,
} from "@/frontend/lib/auth"
import { getFirebaseAuth, initializeFirebase } from "@/frontend/lib/firebase"

export interface AuthState {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	signInWithEmail: (email: string, password: string) => Promise<User>
	signInWithGoogle: () => Promise<User>
	signOut: () => Promise<void>
	getAuthErrorMessage: (error: unknown) => string
}

const AuthContext = createContext<AuthState | undefined>(undefined)

interface AuthProviderProps {
	children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		initializeFirebase()
		const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
			setUser(nextUser)
			setIsLoading(false)
		})

		return unsubscribe
	}, [])

	const value = useMemo<AuthState>(() => ({
		user,
		isAuthenticated: user !== null,
		isLoading,
		signInWithEmail,
		signInWithGoogle,
		signOut: signOutCurrentUser,
		getAuthErrorMessage,
	}), [user, isLoading])

	return (
		<AuthContext.Provider value={ value }>
			{ children }
		</AuthContext.Provider>
	)
}

export function useAuth(): AuthState {
	const context = useContext(AuthContext)

	if(!context) {
		throw new Error("useAuth must be used within an AuthProvider")
	}

	return context
}
