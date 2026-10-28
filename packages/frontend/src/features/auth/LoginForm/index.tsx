import { Alert, Button, Stack, Text, Title } from "@mantine/core"
import { useRouter } from "@tanstack/react-router"
import { useState } from "react"

import { GoogleMark } from "@/frontend/features/auth/GoogleMark"
import { useAuth } from "@/frontend/hooks/useAuth"
import { APP_NAME } from "@/frontend/lib/appName"
import { sanitizeRedirectPath } from "@/frontend/lib/auth"

interface LoginFormProps {
	redirectTo?: string
}

export function LoginForm({ redirectTo = "/" }: LoginFormProps) {
	const auth = useAuth()
	const router = useRouter()
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const safeRedirectTo = sanitizeRedirectPath(redirectTo)

	async function handleGoogleSignIn() {
		setErrorMessage(null)
		setIsGoogleLoading(true)
		try {
			await auth.signInWithGoogle()
			await router.invalidate()
			router.history.push(safeRedirectTo)
		} catch (error) {
			setErrorMessage(auth.getAuthErrorMessage(error))
		}
		setIsGoogleLoading(false)
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
		</Stack>
	)
}
