import { AppShell } from "@mantine/core"
import { Outlet } from "@tanstack/react-router"

import { AppHeader } from "./AppHeader"
import { AppNavbar } from "./AppNavbar"

const AppLayout = () => {
	return (
		<AppShell
			header={ { height: 60 } }
			navbar={ { width: 300, breakpoint: "sm" } }
			padding="md"
		>
			<AppShell.Header>
				<AppHeader />
			</AppShell.Header>

			<AppShell.Navbar>
				<AppNavbar />
			</AppShell.Navbar>

			<AppShell.Main>
				<Outlet />
			</AppShell.Main>
		</AppShell>
	)
}

export { AppLayout }
