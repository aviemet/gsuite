import { Box } from "@mantine/core"

import * as classes from "./HtmlPreview.css"

interface HtmlPreviewProps {
	html: string
}

export function HtmlPreview({ html }: HtmlPreviewProps) {
	return (
		<Box className={ classes.previewSurface } dangerouslySetInnerHTML={ { __html: html } } />
	)
}
