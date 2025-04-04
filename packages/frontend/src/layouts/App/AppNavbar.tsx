import { NavLink, Stack } from "@mantine/core"
import { IconDashboard, IconSettings, IconSignature } from "@tabler/icons-react"
import { Link, useRouter } from "@tanstack/react-router"

const AppNavbar = () => {
	const router = useRouter()

	return (
		<Stack gap="xs" p="md">
			<NavLink
				component={ Link }
				to="/"
				label="Dashboard"
				leftSection={ <IconDashboard size="1.2rem" /> }
				active={ router.state.location.pathname === "/" }
			/>

			<NavLink
				component={ Link }
				to="/signatures"
				label="Signatures"
				leftSection={ <IconSignature size="1.2rem" /> }
				active={ router.state.location.pathname.startsWith("/signatures") }
			/>

			<NavLink
				component={ Link }
				to="/settings"
				label="Settings"
				leftSection={ <IconSettings size="1.2rem" /> }
				active={ router.state.location.pathname === "/settings" }
			/>
		</Stack>
	)
}

export { AppNavbar }
