import clsx from "clsx"

import { APP_NAME } from "@/frontend/lib/appName"

import * as classes from "../Home.css"

const points = [
	`${ APP_NAME } asks for read-only Directory access so it can resolve people, groups, and organizational units for assignment.`,
	"It asks for Gmail signature settings so it can set each mailbox signature through Google's API. It does not read mail.",
	"Your team signs in with Google. Site access is granted by email with super admin, admin, editor, or viewer roles.",
] as const

export function TrustSection() {
	return (
		<section className={ clsx(classes.section) }>
			<h2 className={ clsx(classes.sectionHeading) }>Permissions and access</h2>
			<p className={ clsx(classes.sectionSupport) }>
				Plain statements about what the app requests and why.
			</p>
			<ul className={ clsx(classes.trustList) }>
				{ points.map((point) => (
					<li key={ point } className={ clsx(classes.trustItem) }>{ point }</li>
				)) }
			</ul>
		</section>
	)
}
