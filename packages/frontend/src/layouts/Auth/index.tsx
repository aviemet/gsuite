import { Paper } from "@mantine/core"
import { IconSignature } from "@tabler/icons-react"
import { type ReactNode } from "react"

import * as classes from "./Auth.css"

interface AuthLayoutProps {
	children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className={ classes.shell }>
			<div className={ classes.panel }>
				<div className={ classes.brand }>
					<span className={ classes.brandMark } aria-hidden>
						<IconSignature size={ 20 } />
					</span>
					<span className={ classes.brandName }>Signature Manager</span>
				</div>
				<Paper withBorder p="xl" radius="md" shadow="sm">
					{ children }
				</Paper>
			</div>
		</div>
	)
}
