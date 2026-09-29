import { LoginForm } from "@/frontend/features/auth/LoginForm"
import { AuthLayout } from "@/frontend/layouts"

interface LoginPageProps {
	redirectTo?: string
}

export function LoginPage({ redirectTo }: LoginPageProps) {
	return (
		<AuthLayout>
			<LoginForm redirectTo={ redirectTo } />
		</AuthLayout>
	)
}
