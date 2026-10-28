import { AppShell, Box, Burger, Center, Group, Loader, NavLink, Stack } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconDashboard, IconDesk, IconSettings, IconSignature } from "@tabler/icons-react"
import { Link, Outlet, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { PAGE_TITLE_PORTAL_ID } from "@/frontend/components/Page"
import { useWorkspaceConnectionGate } from "@/frontend/components/RequireWorkspaceConnection"
import { UserMenu } from "@/frontend/components/UserMenu"
import { APP_NAME } from "@/frontend/lib/appName"
import { router } from "@/frontend/routes"

import * as classes from "./App.css"

const useCurrentPath = () => {
	const [currentPath, setCurrentPath] = useState(router.state.location.pathname)

	useEffect(() => {
		const unsubscribe = router.subscribe("onResolved", () => {
			setCurrentPath(router.state.location.pathname)
		})

		return () => unsubscribe()
	}, [])

	return currentPath
}

export function AppLayout() {
	const [opened, { toggle }] = useDisclosure()
	const currentPath = useCurrentPath()
	const navigate = useNavigate()
	const gate = useWorkspaceConnectionGate()

	useEffect(() => {
		if(!gate.redirectTo) return
		void navigate({ to: gate.redirectTo })
	}, [gate.redirectTo, navigate])

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
			<a className={ classes.skipLink } href="#main-content">Skip to content</a>

			<AppShell.Header className={ classes.header }>
				<Group h="100%" px="sm" justify="space-between" wrap="nowrap">
					<Group wrap="nowrap">
						<Burger
							opened={ opened }
							onClick={ toggle }
							hiddenFrom="sm"
							size="sm"
							aria-label={ opened ? "Close navigation" : "Open navigation" }
						/>
						<Box id={ PAGE_TITLE_PORTAL_ID } />
					</Group>
					<UserMenu />
				</Group>
			</AppShell.Header>

			<AppShell.Navbar className={ classes.navbar } aria-label="Primary">
				<div className={ classes.brand }>
					<span className={ classes.brandMark } aria-hidden>
						<IconDesk size={ 16 } />
					</span>
					<span className={ classes.brandName }>{ APP_NAME }</span>
				</div>

				<Stack gap={ 4 } p="sm" pt={ 4 }>
					{ gate.hasMembership
						? (
							<>
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
							</>
						)
						: null }

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
			<AppShell.Main id="main-content" className={ classes.main }>
				{ gate.blocksApp
					? (
						<Center mih="12rem">
							<Loader />
						</Center>
					)
					: <Outlet /> }
			</AppShell.Main>
		</AppShell>
	)
}
