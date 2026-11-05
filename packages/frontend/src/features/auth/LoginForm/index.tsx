import { Alert, Button, Stack, Text, Title } from "@mantine/core"
import { useRouter } from "@tanstack/react-router"
import { useState } from "react"

import { GoogleMark } from "@/frontend/features/auth/GoogleMark"
import { useAuth } from "@/frontend/hooks/useAuth"
import { APP_NAME } from "@/frontend/lib/appName"
import { sanitizeRedirectPath } from "@/frontend/lib/auth"
import { SEED_WORKSPACE_ADMIN_EMAIL } from "@/shared/workspace"

interface LoginFormProps {
	redirectTo?: string
}

export function LoginForm({ redirectTo = "/" }: LoginFormProps) {
	const auth = useAuth()
	const router = useRouter()
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const [isMockLoading, setIsMockLoading] = useState(false)
	const safeRedirectTo = sanitizeRedirectPath(redirectTo)
	const showMockSignIn = import.meta.env.DEV

	async function completeSignIn(signIn: () => Promise<unknown>) {
		setErrorMessage(null)
		try {
			await signIn()
			await router.invalidate()
			router.history.push(safeRedirectTo)
		} catch (error) {
			setErrorMessage(auth.getAuthErrorMessage(error))
		}
	}

	async function handleGoogleSignIn() {
		setIsGoogleLoading(true)
		await completeSignIn(() => auth.signInWithGoogle())
		setIsGoogleLoading(false)
	}

	async function handleMockSignIn() {
		setIsMockLoading(true)
		await completeSignIn(() => auth.signInAsMockWorkspaceAdmin())
		setIsMockLoading(false)
	}

	return (
		<Stack gap="md">
			<div>
				<Title order={ 1 } size="h3">Sign in</Title>
				<Text c="dimmed" size="sm" mt={ 4 }>
					Access { APP_NAME } with your corporate Google account.
				</Text>
			</div>

			{ errorMessage && (
				<Alert color="red" title="Sign-in failed" variant="light">
					{ errorMessage }
				</Alert>
			) }

			<Button
				variant="filled"
				fullWidth
				leftSection={ <GoogleMark size={ 18 } /> }
				loading={ isGoogleLoading }
				onClick={ handleGoogleSignIn }
			>
				Continue with Google
			</Button>

			{ showMockSignIn
				? (
					<Stack gap="xs">
						<Button
							variant="default"
							fullWidth
							loading={ isMockLoading }
							onClick={ handleMockSignIn }
						>
							Continue as Jane Doe (local mock)
						</Button>
						<Text c="dimmed" size="xs">
							Local Directory mock only accepts { SEED_WORKSPACE_ADMIN_EMAIL }. Skip the Auth Emulator account generator.
						</Text>
					</Stack>
				)
				: null }
		</Stack>
	)
}
