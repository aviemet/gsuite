import clsx from "clsx"

import * as classes from "../Home.css"

const features = [
	{
		title: "Templates with directory fields",
		body: "Pull names, titles, phones, and other Workspace Directory values into each signature so personal details stay accurate.",
	},
	{
		title: "Conditional sections",
		body: "Show or hide blocks when a field is present, so missing data never leaves an empty line in the signature.",
	},
	{
		title: "Assign by person, group, or OU",
		body: "Resolution order is person, then group, then deepest organizational unit, then a default. Each target belongs to one template.",
	},
	{
		title: "Automatic daily reapply",
		body: "Templates marked for the 24-hour schedule are redeployed every day, so edits and new hires stay covered.",
	},
] as const

export function FeatureGrid() {
	return (
		<section className={ clsx(classes.section) }>
			<h2 className={ clsx(classes.sectionHeading) }>What it does</h2>
			<p className={ clsx(classes.sectionSupport) }>
				Built around Google Workspace Directory and Gmail signature settings. No extra clients to install.
			</p>
			<div className={ clsx(classes.featureGrid) }>
				{ features.map((feature) => (
					<article key={ feature.title } className={ clsx(classes.feature) }>
						<h3 className={ clsx(classes.featureTitle) }>{ feature.title }</h3>
						<p className={ clsx(classes.featureBody) }>{ feature.body }</p>
					</article>
				)) }
			</div>
		</section>
	)
}
