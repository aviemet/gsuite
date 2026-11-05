import { Text, Tooltip, UnstyledButton } from "@mantine/core"
import {
	IconBriefcase,
	IconBuilding,
	IconCamera,
	IconCheck,
	IconChevronRight,
	IconCoin,
	IconDeviceDesktop,
	IconDeviceMobile,
	IconFileText,
	IconHome,
	IconId,
	IconLink,
	IconMail,
	IconMap,
	IconMapPin,
	IconNotebook,
	IconPhone,
	IconStairs,
	IconUser,
	IconUserCircle,
	IconUsers,
	IconUserStar,
	IconWorld,
} from "@tabler/icons-react"
import clsx from "clsx"
import { useState } from "react"

import {
	getPlaceholderInsertValue,
	type PlaceholderInsertMode,
	type PlaceholderToken,
	templatePlaceholders,
} from "@/shared/templatePlaceholders"

import * as classes from "./PlaceholderPicker.css"

type CatalogPlaceholder = typeof templatePlaceholders[number]

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

export function PlaceholderCard({ placeholder, mode, onInsert }: PlaceholderCardProps) {
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
				<span className={ classes.cardIconWell }>
					<Icon size={ 16 } />
				</span>
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
