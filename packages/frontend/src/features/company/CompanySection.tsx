import { Paper, Stack, Text, Title } from "@mantine/core"
import clsx from "clsx"
import { type ReactNode, useId } from "react"

import * as classes from "./CompanySection.css"

interface CompanySectionProps {
	title?: string
	description?: string
	children: ReactNode
}

export function CompanySection({ title, description, children }: CompanySectionProps) {
	const titleId = useId()

	return (
		<Paper
			component="section"
			aria-labelledby={ title ? titleId : undefined }
			p="md"
			className={ clsx(classes.section) }
		>
			<Stack gap="sm">
				{ title
					? (
						<Stack gap={ 4 }>
							<Title id={ titleId } order={ 2 } size="h4">{ title }</Title>
							{ description
								? <Text c="dimmed" size="sm">{ description }</Text>
								: null }
						</Stack>
					)
					: null }
				{ children }
			</Stack>
		</Paper>
	)
}
