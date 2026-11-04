import { AppShell, Box, Burger, Center, Group, Loader, NavLink, Stack } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconDashboard, IconSettings, IconSignature, IconUsers } from "@tabler/icons-react"
import { Link, Outlet, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { BrandLogo } from "@/frontend/components/BrandLogo"
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
	const [opened, { toggle, close }] = useDisclosure()
	const currentPath = useCurrentPath()
	const navigate = useNavigate()
	const gate = useWorkspaceConnectionGate()

	useEffect(() => {
		if(!gate.redirectTo) return
		void navigate({ to: gate.redirectTo })
	}, [gate.redirectTo, navigate])

	useEffect(() => {
		const unsubscribe = router.subscribe("onResolved", () => {
			close()
		})

		return () => unsubscribe()
	}, [close])

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
					<div className={ classes.brandIdentity }>
						<BrandLogo className={ classes.brandMark } size={ 28 } />
						<span className={ classes.brandName }>{ APP_NAME }</span>
					</div>
					<Burger
						opened={ opened }
						onClick={ toggle }
						hiddenFrom="sm"
						size="sm"
						color="gray.0"
						aria-label={ opened ? "Close navigation" : "Open navigation" }
					/>
				</div>

				<Stack gap={ 4 } p="sm" pt={ 4 }>
					{ gate.hasMembership
						? (
							<>
								<NavLink
									className={ classes.navLink }
									component={ Link }
									to="/admin"
									label="Dashboard"
									leftSection={ <IconDashboard size="1.2rem" /> }
									active={ currentPath === "/admin" }
								/>

								<NavLink
									className={ classes.navLink }
									component={ Link }
									to="/admin/signatures"
									label="Signatures"
									leftSection={ <IconSignature size="1.2rem" /> }
									active={ currentPath.startsWith("/admin/signatures") }
								/>

								<NavLink
									className={ classes.navLink }
									label="Directory"
									leftSection={ <IconUsers size="1.2rem" /> }
									active={ currentPath.startsWith("/admin/directory") }
									defaultOpened={ currentPath.startsWith("/admin/directory") }
								>
									<NavLink
										className={ classes.navLink }
										component={ Link }
										to="/admin/directory/users"
										label="Users"
										active={ currentPath === "/admin/directory/users" }
									/>
									<NavLink
										className={ classes.navLink }
										component={ Link }
										to="/admin/directory/groups"
										label="Groups"
										active={ currentPath === "/admin/directory/groups" }
									/>
									<NavLink
										className={ classes.navLink }
										component={ Link }
										to="/admin/directory/ous"
										label="OUs"
										active={ currentPath === "/admin/directory/ous" }
									/>
								</NavLink>
							</>
						)
						: null }

					<NavLink
						className={ classes.navLink }
						component={ Link }
						to="/admin/settings"
						label="Settings"
						leftSection={ <IconSettings size="1.2rem" /> }
						active={ currentPath === "/admin/settings" }
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
