import { css } from "@linaria/core"
import { vars } from "@/frontend/lib/theme"

export const cardRoot = css`
	position: relative;
	display: flex;
	flex-direction: column;
	height: 100%;
`

export const editButton = css`
	padding: 4px;
	min-width: 0;
	color: ${ vars.colors.gray[3] };
	transition: color 0.15s, background 0.15s;

	&:hover {
		color: ${ vars.colors.blue[7] };
		background: ${ vars.colors.blue[0] };
	}
`

export const previewFrame = css`
	flex: 1;
	min-height: 8rem;
	overflow: hidden;
	pointer-events: none;
	border: 1px solid #dee2e6;
	border-radius: ${ vars.radius.md };
	background-color: #ffffff;
	color: #000000;
	color-scheme: light;
	padding: ${ vars.spacing.sm };
`

export const previewContent = css`
	font-size: 0.875rem;
	line-height: 1.4;

	p {
		margin: 0;
	}

	p + p {
		margin-top: 0.25rem;
	}
`
