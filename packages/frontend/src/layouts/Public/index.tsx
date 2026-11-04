import { Button } from "@mantine/core"
import { Link, Outlet } from "@tanstack/react-router"
import clsx from "clsx"
import { type ReactNode } from "react"

import { BrandLogo } from "@/frontend/components/BrandLogo"
import { useAuth } from "@/frontend/hooks/useAuth"
import { APP_NAME } from "@/frontend/lib/appName"
import { CONTACT_EMAIL } from "@/frontend/lib/legal"

import * as classes from "./Public.css"

interface PublicLayoutProps {
	children?: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
	const { isAuthenticated } = useAuth()

	return (
		<div className={ clsx(classes.shell) }>
			<header className={ clsx(classes.header) }>
				<Link to="/" className={ clsx(classes.brand) }>
					<BrandLogo className={ clsx(classes.brandMark) } size={ 32 } />
					<span className={ clsx(classes.brandName) }>{ APP_NAME }</span>
				</Link>
				{ isAuthenticated
					? (
						<Button component={ Link } to="/admin" variant="filled">
							Go to dashboard
						</Button>
					)
					: (
						<Button component={ Link } to="/login" variant="filled">
							Sign in
						</Button>
					) }
			</header>
			<main className={ clsx(classes.main) }>
				{ children ?? <Outlet /> }
			</main>
			<footer className={ clsx(classes.footer) }>
				<span>© { new Date().getFullYear() } { APP_NAME }</span>
				<div className={ clsx(classes.footerLinks) }>
					<Link to="/support" className={ clsx(classes.footerLink) }>Support</Link>
					<Link to="/privacy" className={ clsx(classes.footerLink) }>Privacy</Link>
					<Link to="/terms" className={ clsx(classes.footerLink) }>Terms</Link>
					<a href={ `mailto:${ CONTACT_EMAIL }` } className={ clsx(classes.footerLink) }>
						{ CONTACT_EMAIL }
					</a>
				</div>
			</footer>
		</div>
	)
}
