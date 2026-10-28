import { Box } from "@mantine/core"
import clsx from "clsx"
import { type ReactNode } from "react"

import * as classes from "./SignatureTemplateForm.css"

interface ComposeEditorShellProps {
	to: string
	subject: string
	children: ReactNode
}

export function ComposeEditorShell({ to, subject, children }: ComposeEditorShellProps) {
	return (
		<Box className={ clsx(classes.composeShell) }>
			<Box className={ classes.composeTitleBar }>New message</Box>
			<Box className={ classes.composeMeta }>
				<Box className={ classes.composeMetaRow }>
					<span className={ classes.composeMetaLabel }>To</span>
					<span>{ to }</span>
				</Box>
				<Box className={ classes.composeMetaRow }>
					<span className={ classes.composeMetaLabel }>Subject</span>
					<span>{ subject }</span>
				</Box>
			</Box>
			<Box className={ classes.composeBody }>
				{ children }
			</Box>
		</Box>
	)
}
