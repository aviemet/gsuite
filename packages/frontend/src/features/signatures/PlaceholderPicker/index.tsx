import { ActionIcon, Group, Paper, SimpleGrid, Tabs, Text, Tooltip } from "@mantine/core"
import { IconBuilding, IconCode, IconInfoCircle, IconShare, IconUser } from "@tabler/icons-react"
import { useState } from "react"

import {
	type PlaceholderInsertMode,
	templatePlaceholders,
} from "@/shared/templatePlaceholders"

import { PlaceholderCard } from "./PlaceholderCard"
import * as classes from "./PlaceholderPicker.css"

const placeholderTabs = ["details", "company", "conditional", "social"] as const

type PlaceholderTab = typeof placeholderTabs[number]

const tabLabels: Record<PlaceholderTab, string> = {
	details: "Details",
	company: "Company",
	conditional: "Conditional",
	social: "Social",
}

function isPlaceholderTab(value: string | null): value is PlaceholderTab {
	return placeholderTabs.some((tab) => tab === value)
}

function placeholdersForTab(tab: PlaceholderTab) {
	if(tab === "conditional") {
		return [...templatePlaceholders]
	}

	return templatePlaceholders.filter((placeholder) => placeholder.category === tab)
}

function insertModeForTab(tab: PlaceholderTab): PlaceholderInsertMode {
	if(tab === "conditional") {
		return "conditional"
	}

	return "value"
}

interface PlaceholderPickerProps {
	onInsert: (value: string) => void
}

export function PlaceholderPicker({ onInsert }: PlaceholderPickerProps) {
	const [tab, setTab] = useState<PlaceholderTab>("details")

	return (
		<Paper className={ classes.panel } p="md" radius="md">
			<Group gap="xs" mb="sm">
				<Text className={ classes.heading } size="sm">Placeholders</Text>
				<Tooltip
					label="These tokens are filled from each user's Google Workspace Directory profile when the signature is applied. Click a card to insert the token at the cursor."
					multiline
					w={ 280 }
					withArrow
				>
					<ActionIcon variant="subtle" size="sm" aria-label="About placeholders">
						<IconInfoCircle size={ 16 } />
					</ActionIcon>
				</Tooltip>
			</Group>
			<Tabs
				variant="pills"
				radius="md"
				value={ tab }
				onChange={ (value) => {
					if(isPlaceholderTab(value)) {
						setTab(value)
					}
				} }
			>
				<Tabs.List mb="md">
					<Tabs.Tab value="details" leftSection={ <IconUser size={ 14 } /> }>
						{ tabLabels.details }
					</Tabs.Tab>
					<Tabs.Tab value="company" leftSection={ <IconBuilding size={ 14 } /> }>
						{ tabLabels.company }
					</Tabs.Tab>
					<Tabs.Tab value="conditional" leftSection={ <IconCode size={ 14 } /> }>
						{ tabLabels.conditional }
					</Tabs.Tab>
					<Tabs.Tab value="social" leftSection={ <IconShare size={ 14 } /> }>
						{ tabLabels.social }
					</Tabs.Tab>
				</Tabs.List>
				{ placeholderTabs.map((tabValue) => (
					<Tabs.Panel key={ tabValue } value={ tabValue }>
						<SimpleGrid cols={ { base: 1, xs: 2, sm: 3, md: 4 } } spacing="sm">
							{ placeholdersForTab(tabValue).map((placeholder) => (
								<PlaceholderCard
									key={ `${ tabValue }-${ placeholder.token }` }
									placeholder={ placeholder }
									mode={ insertModeForTab(tabValue) }
									onInsert={ onInsert }
								/>
							)) }
						</SimpleGrid>
					</Tabs.Panel>
				)) }
			</Tabs>
		</Paper>
	)
}
