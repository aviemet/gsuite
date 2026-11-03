import clsx from "clsx"

import * as classes from "@/frontend/features/marketing/LegalDocument.css"
import { APP_NAME } from "@/frontend/lib/appName"
import {
	CONTACT_EMAIL,
	EFFECTIVE_DATE,
	LEGAL_ENTITY_NAME,
} from "@/frontend/lib/legal"

export function PrivacyPage() {
	return (
		<article className={ clsx(classes.document) }>
			<h1 className={ clsx(classes.title) }>Privacy Policy</h1>
			<p className={ clsx(classes.meta) }>Effective date: { EFFECTIVE_DATE }</p>
			<p className={ clsx(classes.paragraph) }>
				This policy describes how { LEGAL_ENTITY_NAME } ("we", "us") handles information when you use { APP_NAME }.
				It is a starting draft for review by counsel before you submit the product for Google verification.
			</p>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Google account sign-in</h2>
				<p className={ clsx(classes.paragraph) }>
					When you sign in with Google, we receive your name, email address, and Firebase user id. We use
					that information to authenticate you and to link your account to a customer membership.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Google Workspace Directory data</h2>
				<p className={ clsx(classes.paragraph) }>
					With a domain-wide Marketplace install, { APP_NAME } reads users, groups, and organizational units
					from the Workspace Directory so you can assign signatures. Directory data is read on request to
					resolve assignments and is not stored as a permanent copy of your directory.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Gmail signature settings</h2>
				<p className={ clsx(classes.paragraph) }>
					{ APP_NAME } writes Gmail signature HTML for mailboxes you deploy to. It does not read message
					content, send email on your behalf, or access mailboxes beyond signature settings.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Data we store</h2>
				<p className={ clsx(classes.paragraph) }>
					We store the following in Google Cloud Firestore for each customer:
				</p>
				<ul className={ clsx(classes.list) }>
					<li>Primary Workspace domain and Workspace admin email</li>
					<li>Memberships and access grants by email and role</li>
					<li>Signature templates and assignment targets</li>
					<li>Signature deploy logs</li>
				</ul>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Subprocessors</h2>
				<p className={ clsx(classes.paragraph) }>
					We use Google Cloud and Firebase to host the application, authenticate users, store data, and run
					backend jobs.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Retention and deletion</h2>
				<p className={ clsx(classes.paragraph) }>
					We retain customer data while the account is active. On request to { CONTACT_EMAIL }, we delete
					stored customer data associated with your Workspace, subject to any legal retention requirements.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Google API Services User Data Policy</h2>
				<p className={ clsx(classes.paragraph) }>
					{ APP_NAME }'s use and transfer of information received from Google APIs to any other app will
					adhere to the Google API Services User Data Policy, including the Limited Use requirements.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Contact</h2>
				<p className={ clsx(classes.paragraph) }>
					Questions about this policy: { CONTACT_EMAIL }.
				</p>
			</section>
		</article>
	)
}
