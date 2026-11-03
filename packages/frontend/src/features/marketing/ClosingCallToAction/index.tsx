import { Button } from "@mantine/core"
import { Link } from "@tanstack/react-router"
import clsx from "clsx"

import { useAuth } from "@/frontend/hooks/useAuth"
import { APP_NAME } from "@/frontend/lib/appName"

import * as classes from "../Home.css"

export function ClosingCallToAction() {
	const { isAuthenticated } = useAuth()

	return (
		<section className={ clsx(classes.section, classes.closing) }>
			<h2 className={ clsx(classes.sectionHeading) }>Ready when your Workspace is</h2>
			<p className={ clsx(classes.sectionSupport) }>
				Sign in with Google, install { APP_NAME } for your domain, and connect.
			</p>
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
		</section>
	)
}
