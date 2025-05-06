import React from "react"

interface HtmlPreviewProps {
	html: string
}

export const HtmlPreview: React.FC<HtmlPreviewProps> = ({ html }) => (
	<div dangerouslySetInnerHTML={ { __html: html } } />
)
