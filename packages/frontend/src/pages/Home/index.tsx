import { ClosingCallToAction } from "@/frontend/features/marketing/ClosingCallToAction"
import { FeatureGrid } from "@/frontend/features/marketing/FeatureGrid"
import * as classes from "@/frontend/features/marketing/Home.css"
import { Hero } from "@/frontend/features/marketing/Hero"
import { HowItWorks } from "@/frontend/features/marketing/HowItWorks"
import { TrustSection } from "@/frontend/features/marketing/TrustSection"

export function HomePage() {
	return (
		<div className={ classes.page }>
			<Hero />
			<FeatureGrid />
			<HowItWorks />
			<TrustSection />
			<ClosingCallToAction />
		</div>
	)
}
