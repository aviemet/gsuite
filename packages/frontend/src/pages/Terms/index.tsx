import clsx from "clsx"

import * as classes from "@/frontend/features/marketing/LegalDocument.css"
import { APP_NAME } from "@/frontend/lib/appName"
import {
	CONTACT_EMAIL,
	EFFECTIVE_DATE,
	GOVERNING_JURISDICTION,
	LEGAL_ENTITY_NAME,
} from "@/frontend/lib/legal"

export function TermsPage() {
	return (
		<article className={ clsx(classes.document) }>
			<h1 className={ clsx(classes.title) }>Terms of Service</h1>
			<p className={ clsx(classes.meta) }>Effective date: { EFFECTIVE_DATE }</p>
			<p className={ clsx(classes.paragraph) }>
				These terms govern use of { APP_NAME }, operated by { LEGAL_ENTITY_NAME } ("we", "us"). They are a
				starting draft for review by counsel before you submit the product for Google verification.
			</p>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>The service</h2>
				<p className={ clsx(classes.paragraph) }>
					{ APP_NAME } helps Google Workspace customers design signature templates, assign them by person,
					group, or organizational unit, and deploy them to Gmail signature settings.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Accounts and Workspace responsibility</h2>
				<p className={ clsx(classes.paragraph) }>
					You must sign in with a Google account. Connecting a Workspace domain requires a Super Admin who
					installs the Marketplace listing for that domain. You are responsible for the accounts you grant
					access to inside { APP_NAME }, for the templates you deploy, and for complying with your own
					Workspace policies.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Acceptable use</h2>
				<p className={ clsx(classes.paragraph) }>
					You may use { APP_NAME } only for lawful purposes and only on Workspace domains you are authorized
					to administer. You may not attempt to access other customers' data, disrupt the service, or use
					the product to send spam or misleading communications.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Your content</h2>
				<p className={ clsx(classes.paragraph) }>
					You retain ownership of signature templates and other content you create in { APP_NAME }. You grant
					us a limited license to host, process, and deploy that content as needed to provide the service.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Fees</h2>
				<p className={ clsx(classes.paragraph) }>
					[Fees and billing terms to be defined.] If paid plans are offered later, those terms will be
					described at the time of purchase.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Termination</h2>
				<p className={ clsx(classes.paragraph) }>
					You may stop using the service at any time and may request deletion of stored customer data. We may
					suspend or terminate access if you violate these terms or if continued operation is no longer
					practical.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Disclaimer and limitation of liability</h2>
				<p className={ clsx(classes.paragraph) }>
					The service is provided as is, without warranties of any kind to the fullest extent permitted by
					law. To the fullest extent permitted by law, { LEGAL_ENTITY_NAME } is not liable for indirect,
					incidental, special, consequential, or punitive damages, or for lost profits, data, or goodwill,
					arising from use of the service.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Governing law</h2>
				<p className={ clsx(classes.paragraph) }>
					These terms are governed by the laws of { GOVERNING_JURISDICTION }, without regard to conflict of
					law rules.
				</p>
			</section>

			<section className={ clsx(classes.section) }>
				<h2 className={ clsx(classes.heading) }>Contact</h2>
				<p className={ clsx(classes.paragraph) }>
					Questions about these terms: { CONTACT_EMAIL }.
				</p>
			</section>
		</article>
	)
}
