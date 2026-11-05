import clsx from "clsx"

import * as classes from "../Home.css"

const steps = [
	{
		number: "01",
		title: "Install from the Marketplace",
		body: "A Workspace Super Admin installs the app once for the company. Google grants the permissions during that install.",
	},
	{
		number: "02",
		title: "Design a template",
		body: "Write the signature once, with Directory fields and optional conditional sections.",
	},
	{
		number: "03",
		title: "Assign and deploy",
		body: "Choose people, groups, or organizational units, then apply now or on the daily schedule.",
	},
] as const

export function HowItWorks() {
	return (
		<section className={ clsx(classes.section) }>
			<h2 className={ clsx(classes.sectionHeading) }>How it works</h2>
			<p className={ clsx(classes.sectionSupport) }>
				Three steps from an empty Workspace to signatures that stay current.
			</p>
			<div className={ clsx(classes.steps) }>
				{ steps.map((step) => (
					<article key={ step.number } className={ clsx(classes.step) }>
						<div className={ clsx(classes.stepNumber) }>Step { step.number }</div>
						<h3 className={ clsx(classes.featureTitle) }>{ step.title }</h3>
						<p className={ clsx(classes.featureBody) }>{ step.body }</p>
					</article>
				)) }
			</div>
		</section>
	)
}
