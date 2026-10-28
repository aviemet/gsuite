import { Avatar, Menu, Text, UnstyledButton, useComputedColorScheme, useMantineColorScheme } from "@mantine/core"
import { IconLogout, IconMoon, IconSun } from "@tabler/icons-react"
import { useState } from "react"

import { useAuth } from "@/frontend/hooks/useAuth"
import { queryClient } from "@/frontend/lib/query"

export function UserMenu() {
	const auth = useAuth()
	const { setColorScheme } = useMantineColorScheme()
	const computedColorScheme = useComputedColorScheme("light")
	const isDark = computedColorScheme === "dark"
	const displayName = auth.user?.displayName || auth.user?.email || "Account"
	const [isSigningOut, setIsSigningOut] = useState(false)

	async function handleSignOut() {
		setIsSigningOut(true)

		try {
			await auth.signOut()
			queryClient.clear()
			window.location.assign("/login")
		} catch{
			setIsSigningOut(false)
		}
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
					disabled={ isSigningOut }
				>
					Sign out
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	)
}
