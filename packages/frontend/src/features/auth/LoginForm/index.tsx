import { Alert, Button, Divider, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconBrandGoogle } from "@tabler/icons-react"
import { useRouter } from "@tanstack/react-router"
import { useState } from "react"

import { useAuth } from "@/frontend/hooks/useAuth"
import { sanitizeRedirectPath } from "@/frontend/lib/auth"

interface LoginFormValues {
	email: string
	password: string
}

interface LoginFormProps {
	redirectTo?: string
}

export function LoginForm({ redirectTo = "/" }: LoginFormProps) {
	const auth = useAuth()
	const router = useRouter()
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [isEmailLoading, setIsEmailLoading] = useState(false)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const safeRedirectTo = sanitizeRedirectPath(redirectTo)

	const form = useForm<LoginFormValues>({
		initialValues: {
			email: "",
			password: "",
		},
		validate: {
			email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address"),
			password: (value) => (value.length > 0 ? null : "Enter your password"),
		},
	})

	async function completeSignIn(action: () => Promise<unknown>) {
		setErrorMessage(null)
		try {
			await action()
			await router.invalidate()
			router.history.push(safeRedirectTo)
		} catch(error) {
			setErrorMessage(auth.getAuthErrorMessage(error))
		}
	}

	async function handleEmailSubmit(values: LoginFormValues) {
		setIsEmailLoading(true)
		await completeSignIn(() => auth.signInWithEmail(values.email, values.password))
		setIsEmailLoading(false)
	}

	async function handleGoogleSignIn() {
		setIsGoogleLoading(true)
		await completeSignIn(() => auth.signInWithGoogle())
		setIsGoogleLoading(false)
	}

	return (
		<Stack gap="md">
			<div>
				<Title order={ 2 } size="h3">Sign in</Title>
				<Text c="dimmed" size="sm" mt={ 4 }>
					Use your Google account or email and password.
				</Text>
			</div>

			{ errorMessage && (
				<Alert color="red" title="Sign-in failed" variant="light">
					{ errorMessage }
				</Alert>
			) }

			<Button
				variant="default"
				fullWidth
				leftSection={ <IconBrandGoogle size={ 18 } /> }
				loading={ isGoogleLoading }
				onClick={ handleGoogleSignIn }
			>
				Continue with Google
			</Button>

			<Divider label="or" labelPosition="center" />

			<form onSubmit={ form.onSubmit(handleEmailSubmit) }>
				<Stack gap="sm">
					<TextInput
						label="Email"
						placeholder="you@company.com"
						autoComplete="email"
						{ ...form.getInputProps("email") }
					/>
					<PasswordInput
						label="Password"
						placeholder="Your password"
						autoComplete="current-password"
						{ ...form.getInputProps("password") }
					/>
					<Button type="submit" fullWidth loading={ isEmailLoading }>
						Sign in
					</Button>
				</Stack>
			</form>
		</Stack>
	)
}
