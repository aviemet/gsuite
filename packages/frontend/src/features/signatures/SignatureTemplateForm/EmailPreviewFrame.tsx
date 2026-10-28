import { Box } from "@mantine/core"
import clsx from "clsx"
import { type ReactNode } from "react"

import * as classes from "./SignatureTemplateForm.css"

interface EmailPreviewFrameProps {
	senderName: string
	senderEmail: string
	children: ReactNode
}

export function EmailPreviewFrame({ senderName, senderEmail, children }: EmailPreviewFrameProps) {
	return (
		<Box className={ clsx(classes.previewShell) }>
			<Box className={ classes.previewMeta }>
				<Box className={ classes.previewMetaPrimary }>
					<span className={ classes.previewSender }>{ senderName }</span>
					<span className={ classes.previewEmail }>{ senderEmail }</span>
				</Box>
				<span className={ classes.previewBadge }>Preview · not sent</span>
			</Box>
			<Box className={ classes.previewSheet }>
				{ children }
			</Box>
		</Box>
	)
}
