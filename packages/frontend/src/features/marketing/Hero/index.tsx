import { Button } from "@mantine/core"
import { Link } from "@tanstack/react-router"
import clsx from "clsx"

import { useAuth } from "@/frontend/hooks/useAuth"
import { APP_NAME } from "@/frontend/lib/appName"

import * as classes from "../Home.css"

export function Hero() {
	const { isAuthenticated } = useAuth()

	return (
		<section className={ clsx(classes.section, classes.hero) }>
			<div className={ clsx(classes.heroCopy) }>
				<div className={ clsx(classes.brandLead) }>{ APP_NAME }</div>
				<h1 className={ clsx(classes.headline) }>
					Consistent Gmail signatures for your whole Google Workspace
				</h1>
				<p className={ clsx(classes.supporting) }>
					Design one template, assign it by person, group, or organizational unit, and keep every mailbox up to date.
				</p>
				<div className={ clsx(classes.actions) }>
					{ isAuthenticated
						? (
							<Button component={ Link } to="/admin" size="md">
								Go to dashboard
							</Button>
						)
						: (
							<Button component={ Link } to="/login" size="md">
								Get started
							</Button>
						) }
				</div>
			</div>
			<div className={ clsx(classes.preview) } aria-hidden>
				<div className={ clsx(classes.previewLabel) }>Signature preview</div>
				<div className={ clsx(classes.previewBody) }>
					<div className={ clsx(classes.previewName) }>Jordan Hale</div>
					<div className={ clsx(classes.previewMeta) }>Customer Success · Northwind</div>
					<div className={ clsx(classes.previewRule) } />
					<div>jordan.hale@northwind.example</div>
					<div>+1 (415) 555-0142</div>
				</div>
			</div>
		</section>
	)
}
