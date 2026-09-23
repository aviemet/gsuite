import { AppShell, Box, Burger, Group, NavLink, Stack } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconDashboard, IconSettings, IconSignature } from "@tabler/icons-react"
import { Link, Outlet } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { PAGE_TITLE_PORTAL_ID } from "@/frontend/components/Page"
import { UserMenu } from "@/frontend/components/UserMenu"
import { router } from "@/frontend/routes"

import * as classes from "./App.css"

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

export function AppLayout() {
	const [opened, { toggle }] = useDisclosure()
	const currentPath = useCurrentPath()

	return (
		<AppShell
			layout="alt"
			header={ { height: 56 } }
			navbar={ {
				width: 232,
				breakpoint: "sm",
				collapsed: { mobile: !opened },
			} }
			padding="md"
		>
			<AppShell.Header className={ classes.header }>
				<Group h="100%" px="sm" justify="space-between" wrap="nowrap">
					<Group wrap="nowrap">
						<Burger opened={ opened } onClick={ toggle } hiddenFrom="sm" size="sm" />
						<Box id={ PAGE_TITLE_PORTAL_ID } />
					</Group>
					<UserMenu />
				</Group>
			</AppShell.Header>

			<AppShell.Navbar className={ classes.navbar }>
				<div className={ classes.brand }>
					<span className={ classes.brandMark } aria-hidden>
						<IconSignature size={ 16 } />
					</span>
					<span className={ classes.brandName }>Signature Manager</span>
				</div>

				<Stack gap={ 4 } p="sm" pt={ 4 }>
					<NavLink
						className={ classes.navLink }
						component={ Link }
						to="/"
						label="Dashboard"
						leftSection={ <IconDashboard size="1.2rem" /> }
						active={ currentPath === "/" }
					/>

					<NavLink
						className={ classes.navLink }
						component={ Link }
						to="/signatures"
						label="Signatures"
						leftSection={ <IconSignature size="1.2rem" /> }
						active={ currentPath.startsWith("/signatures") }
					/>

					<NavLink
						className={ classes.navLink }
						component={ Link }
						to="/settings"
						label="Settings"
						leftSection={ <IconSettings size="1.2rem" /> }
						active={ currentPath === "/settings" }
					/>
				</Stack>
			</AppShell.Navbar>
			<AppShell.Main className={ classes.main }>
				<Outlet />
			</AppShell.Main>
		</AppShell>
	)
}
