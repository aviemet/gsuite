import clsx from "clsx"

import * as classes from "@/frontend/features/marketing/LegalDocument.css"
import { APP_DOMAIN, APP_NAME } from "@/frontend/lib/appName"
import { CONTACT_EMAIL } from "@/frontend/lib/legal"

export function SupportPage() {
	return (
		<article className={ clsx(classes.document) }>
			<h1 className={ clsx(classes.title) }>Support</h1>
			<p className={ clsx(classes.meta) }>
				Help for { APP_NAME } on { APP_DOMAIN }
			</p>
			<p className={ clsx(classes.paragraph) }>
				Use this page when you need help installing { APP_NAME }, connecting Google Workspace, or managing
				signatures. We respond by email during business hours.
			</p>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Contact</h2>
				<p className={ clsx(classes.paragraph) }>
					Email{ " " }
					<a href={ `mailto:${ CONTACT_EMAIL }` }>{ CONTACT_EMAIL }</a>
					{ " " }
					with your Workspace domain and a short description of the problem.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>What to include</h2>
				<ul className={ clsx(classes.list) }>
					<li>Your Google Workspace primary domain</li>
					<li>Whether you are a Workspace Super Admin</li>
					<li>Whether the Marketplace install completed for your domain</li>
					<li>What you were doing when the issue happened, and any error text shown in Settings</li>
				</ul>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Common setup steps</h2>
				<ol className={ clsx(classes.list) }>
					<li>Sign in at https://{ APP_DOMAIN }/login with a Workspace Super Admin account.</li>
					<li>Open Settings and install { APP_NAME } from the Google Workspace Marketplace for your domain.</li>
					<li>Wait a few minutes after install, then click Connect.</li>
					<li>Confirm Directory and Gmail checks on the API status tab before deploying signatures.</li>
				</ol>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Privacy and terms</h2>
				<p className={ clsx(classes.paragraph) }>
					See our{ " " }
					<a href="/privacy">Privacy Policy</a>
					{ " " }
					and{ " " }
					<a href="/terms">Terms of Service</a>
					.
				</p>
			</section>
		</article>
	)
}
