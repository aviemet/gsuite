import { AppShell, Burger, Group, NavLink, Stack } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"

import { IconDashboard, IconSettings, IconSignature } from "@tabler/icons-react"
import { Link, Outlet } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { router } from "@/frontend/routes"

// Custom hook to track the current path
const useCurrentPath = () => {
	const [currentPath, setCurrentPath] = useState(router.state.location.pathname)

	useEffect(() => {
		// Subscribe to router state changes
		const unsubscribe = router.subscribe("onResolved", () => {
			setCurrentPath(router.state.location.pathname)
		})

		// Cleanup subscription on unmount
		return () => unsubscribe()
	}, [])

	return currentPath
}

const AppLayout = () => {
	const [opened, { toggle }] = useDisclosure()
	const currentPath = useCurrentPath()

	return (
		<AppShell
			header={ { height: { base: 60, md: 70, lg: 80 } } }
			navbar={ {
				width: { base: 200, md: 250, lg: 300 },
				breakpoint: "sm",
				collapsed: { mobile: !opened },
			} }
			padding="sm"
		>
			<AppShell.Header>
				<Group h="100%" px="sm">
					<Burger opened={ opened } onClick={ toggle } hiddenFrom="sm" size="sm" />
					Signatures
				</Group>
			</AppShell.Header>

			<AppShell.Navbar>

				<Stack gap="xs" p="sm">
					<NavLink
						component={ Link }
						to="/"
						label="Dashboard"
						leftSection={ <IconDashboard size="1.2rem" /> }
						active={ currentPath === "/" }
					/>

					<NavLink
						component={ Link }
						to="/signatures"
						label="Signatures"
						leftSection={ <IconSignature size="1.2rem" /> }
						active={ currentPath.startsWith("/signatures") }
					/>

					<NavLink
						component={ Link }
						to="/settings"
						label="Settings"
						leftSection={ <IconSettings size="1.2rem" /> }
						active={ currentPath === "/settings" }
					/>
				</Stack>
			</AppShell.Navbar>
			<AppShell.Main>
				<Outlet />
			</AppShell.Main>
		</AppShell>
	)
}

export { AppLayout }
