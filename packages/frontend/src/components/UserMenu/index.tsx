import { Avatar, Menu, Text, UnstyledButton, useComputedColorScheme, useMantineColorScheme } from "@mantine/core"
import { IconLogout, IconMoon, IconSun } from "@tabler/icons-react"
import { useRouter } from "@tanstack/react-router"

import { useAuth } from "@/frontend/hooks/useAuth"

export function UserMenu() {
	const auth = useAuth()
	const router = useRouter()
	const { setColorScheme } = useMantineColorScheme()
	const computedColorScheme = useComputedColorScheme("light")
	const isDark = computedColorScheme === "dark"
	const displayName = auth.user?.displayName || auth.user?.email || "Account"

	async function handleSignOut() {
		await auth.signOut()
		await router.invalidate()
		await router.navigate({
			to: "/login",
			search: {
				redirect: "/",
			},
		})
	}

	return (
		<Menu position="bottom-end" shadow="md" width={ 220 }>
			<Menu.Target>
				<UnstyledButton aria-label="User menu">
					<Avatar
						radius="xl"
						color="harbor"
						variant="filled"
						src={ auth.user?.photoURL ?? undefined }
						alt={ displayName }
					>
						{ displayName.slice(0, 1).toUpperCase() }
					</Avatar>
				</UnstyledButton>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>
					<Text size="sm" truncate>
						{ displayName }
					</Text>
				</Menu.Label>
				<Menu.Item
					leftSection={ isDark ? <IconSun size={ 16 } /> : <IconMoon size={ 16 } /> }
					onClick={ () => setColorScheme(isDark ? "light" : "dark") }
				>
					{ isDark ? "Light mode" : "Dark mode" }
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item
					color="red"
					leftSection={ <IconLogout size={ 16 } /> }
					onClick={ handleSignOut }
				>
					Sign out
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	)
}
