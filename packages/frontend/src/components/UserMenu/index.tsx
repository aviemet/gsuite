import { Avatar, Menu, UnstyledButton, useComputedColorScheme, useMantineColorScheme } from "@mantine/core"
import { IconMoon, IconSun } from "@tabler/icons-react"

export function UserMenu() {
	const { setColorScheme } = useMantineColorScheme()
	const computedColorScheme = useComputedColorScheme("light")
	const isDark = computedColorScheme === "dark"

	return (
		<Menu position="bottom-end" shadow="md" width={ 200 }>
			<Menu.Target>
				<UnstyledButton aria-label="User menu">
					<Avatar radius="xl" />
				</UnstyledButton>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item
					leftSection={ isDark ? <IconSun size={ 16 } /> : <IconMoon size={ 16 } /> }
					onClick={ () => setColorScheme(isDark ? "light" : "dark") }
				>
					{ isDark ? "Light mode" : "Dark mode" }
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	)
}

