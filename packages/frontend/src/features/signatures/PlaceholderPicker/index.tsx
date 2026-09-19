import {
	getPlaceholderInsertValue,
	templatePlaceholders,
	type PlaceholderInsertMode,
	type PlaceholderToken,
} from "@/shared/templatePlaceholders"
import { ActionIcon, Group, Paper, SimpleGrid, Tabs, Text, Tooltip, UnstyledButton } from "@mantine/core"
import {
	IconBriefcase,
	IconBuilding,
	IconCamera,
	IconCheck,
	IconChevronRight,
	IconCode,
	IconCoin,
	IconDeviceDesktop,
	IconDeviceMobile,
	IconFileText,
	IconHome,
	IconId,
	IconInfoCircle,
	IconLink,
	IconMail,
	IconMap,
	IconMapPin,
	IconNotebook,
	IconPhone,
	IconShare,
	IconStairs,
	IconUser,
	IconUserCircle,
	IconUsers,
	IconUserStar,
	IconWorld,
} from "@tabler/icons-react"
import clsx from "clsx"
import { useState } from "react"

import * as classes from "./PlaceholderPicker.css"

const placeholderTabs = ["details", "company", "conditional", "social"] as const

type PlaceholderTab = typeof placeholderTabs[number]
type CatalogPlaceholder = typeof templatePlaceholders[number]

const tabLabels: Record<PlaceholderTab, string> = {
	details: "Details",
	company: "Company",
	conditional: "Conditional",
	social: "Social",
}

const placeholderIcons: Record<PlaceholderToken, typeof IconUser> = {
	fullName: IconUser,
	givenName: IconUserCircle,
	familyName: IconUser,
	employeeId: IconId,
	email: IconMail,
	address: IconMapPin,
	jobTitle: IconBriefcase,
	department: IconUsers,
	workPhone: IconPhone,
	homePhone: IconHome,
	mobile: IconDeviceMobile,
	photoUrl: IconCamera,
	company: IconBuilding,
	costCenter: IconCoin,
	companyLocation: IconMap,
	companyDescription: IconFileText,
	companyDomain: IconWorld,
	managerEmail: IconUserStar,
	buildingId: IconBuilding,
	floorName: IconStairs,
	deskCode: IconDeviceDesktop,
	floorSection: IconMap,
	website: IconWorld,
	workWebsite: IconBriefcase,
	homeWebsite: IconHome,
	blog: IconNotebook,
	profileUrl: IconLink,
}

function isPlaceholderTab(value: string | null): value is PlaceholderTab {
	return placeholderTabs.some((tab) => tab === value)
}

function placeholdersForTab(tab: PlaceholderTab): CatalogPlaceholder[] {
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

function cardLabel(placeholder: CatalogPlaceholder, mode: PlaceholderInsertMode): string {
	if(mode === "conditional") {
		return `If ${ placeholder.label.toLowerCase() }`
	}

	return placeholder.label
}

interface PlaceholderCardProps {
	placeholder: CatalogPlaceholder
	mode: PlaceholderInsertMode
	onInsert: (value: string) => void
}

function PlaceholderCard({ placeholder, mode, onInsert }: PlaceholderCardProps) {
	const Icon = placeholderIcons[placeholder.token]
	const insertValue = getPlaceholderInsertValue(placeholder, mode)
	const [inserted, setInserted] = useState(false)

	return (
		<Tooltip
			label={ `${ insertValue } — ${ placeholder.directoryField }` }
			position="top"
			withArrow
		>
			<UnstyledButton
				type="button"
				className={ classes.card }
				aria-label={ `Insert ${ insertValue }` }
				onMouseDown={ (event) => {
					event.preventDefault()
				} }
				onClick={ () => {
					onInsert(insertValue)
					setInserted(true)
					window.setTimeout(() => {
						setInserted(false)
					}, 1500)
				} }
			>
				<Icon size={ 18 } className={ classes.cardIcon } />
				<div className={ classes.cardBody }>
					<Text size="sm" truncate>
						{ cardLabel(placeholder, mode) }
					</Text>
					<Text size="xs" c="dimmed" ff="monospace" truncate>
						{ insertValue }
					</Text>
				</div>
				{ inserted
					? <IconCheck size={ 16 } className={ clsx(classes.cardChevron, classes.cardInserted) } />
					: <IconChevronRight size={ 16 } className={ classes.cardChevron } /> }
			</UnstyledButton>
		</Tooltip>
	)
}

interface PlaceholderPickerProps {
	onInsert: (value: string) => void
}

export function PlaceholderPicker({ onInsert }: PlaceholderPickerProps) {
	const [tab, setTab] = useState<PlaceholderTab>("details")

	return (
		<Paper withBorder p="md" radius="md">
			<Group gap="xs" mb="sm">
				<Text fw={ 600 } size="sm">Placeholders</Text>
				<Tooltip
					label="These tokens are filled from each user's Google Workspace Directory profile when the signature is applied. Click a card to insert the token at the cursor."
					multiline
					w={ 280 }
					withArrow
				>
					<ActionIcon variant="subtle" color="gray" size="sm" aria-label="About placeholders">
						<IconInfoCircle size={ 16 } />
					</ActionIcon>
				</Tooltip>
			</Group>
			<Tabs
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
