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
	color: light-dark(${ vars.colors.gray[7] }, ${ vars.colors.gray[2] });
	transition: color 0.15s, background 0.15s;

	&:hover {
		color: light-dark(${ vars.colors.harbor[8] }, ${ vars.colors.harbor[2] });
		background: light-dark(${ vars.colors.harbor[0] }, ${ vars.colors.dark[5] });
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
