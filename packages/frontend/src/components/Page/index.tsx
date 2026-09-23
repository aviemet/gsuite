import { Portal, Title } from "@mantine/core"
import { ReactNode } from "react"

export const PAGE_TITLE_PORTAL_ID = "page-title-portal"

interface PageProps {
	title: string
	children?: ReactNode
}

export function Page({ title, children }: PageProps) {
	return (
		<>
			<Portal target={ `#${PAGE_TITLE_PORTAL_ID}` }>
				<Title order={ 1 } size="h3">
					{ title }
				</Title>
			</Portal>
			{ children }
		</>
	)
}
