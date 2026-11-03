import { Button, Stack, Text, Title } from "@mantine/core"

import { APP_NAME } from "@/frontend/lib/appName"

import * as classes from "../ApiStatusPanel/ApiStatusPanel.css"

interface MarketplaceInstallProps {
	marketplaceUrl: string
	stepLabel?: string
}

export function MarketplaceInstall({
	marketplaceUrl,
	stepLabel,
}: MarketplaceInstallProps) {
	const hasMarketplaceUrl = marketplaceUrl.trim().length > 0
	const title = stepLabel
		? `${ stepLabel }: Install ${ APP_NAME } from Google Workspace Marketplace`
		: `Install ${ APP_NAME } from Google Workspace Marketplace`

	return (
		<Stack gap="sm" className={ classes.section }>
			<Title order={ 2 } size="h4">{ title }</Title>
			<Text>
				{ APP_NAME } needs a one-time install from a Super Admin before it can read your directory or set Gmail signatures. Google grants the permissions for the whole company during that install.
			</Text>
			{ hasMarketplaceUrl
				? (
					<Button
						component="a"
						href={ marketplaceUrl }
						target="_blank"
						rel="noreferrer"
					>
						Install from Google Workspace Marketplace
					</Button>
				)
				: (
					<Text c="red">
						The Marketplace listing URL is missing from this deployment. Ask whoever hosts { APP_NAME } to configure it, then reload this page.
					</Text>
				) }
		</Stack>
	)
}
