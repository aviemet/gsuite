import { Box, Paper } from "@mantine/core"
import { IconDesk } from "@tabler/icons-react"
import clsx from "clsx"
import { type ReactNode } from "react"

import { APP_NAME } from "@/frontend/lib/appName"

import * as classes from "./Auth.css"

interface AuthLayoutProps {
	children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<Box className={ clsx(classes.shell) }>
			<main className={ clsx(classes.panel) }>
				<Box className={ clsx(classes.brand) }>
					<span className={ clsx(classes.brandMark) } aria-hidden>
						<IconDesk size={ 20 } />
					</span>
					<span className={ clsx(classes.brandName) }>{ APP_NAME }</span>
				</Box>
				<Paper withBorder p="xl" radius="md" shadow="sm">
					{ children }
				</Paper>
			</main>
		</Box>
	)
}
