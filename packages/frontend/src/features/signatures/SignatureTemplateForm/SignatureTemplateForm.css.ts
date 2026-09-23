import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const paneHeader = css`
	min-height: 2rem;
`

export const paneTitle = css`
	color: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.gray[1] });
	font-weight: 650;
`

export const previewMark = css`
	display: inline-block;
	width: 0.5rem;
	height: 0.5rem;
	margin-right: 0.4rem;
	border-radius: 2px;
	background: ${ vars.colors.copper[5] };
	vertical-align: 0.05em;
`

export const previewWell = css`
	padding: ${ vars.spacing.sm };
	border: 1px solid light-dark(${ vars.colors.copper[2] }, ${ vars.colors.dark[3] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.copper[0] }, ${ vars.colors.dark[4] });
`

export const previewSheet = css`
	min-height: 16rem;
	padding: ${ vars.spacing.md };
	border-radius: ${ vars.radius.sm };
	background: ${ vars.colors.white };
	color: ${ vars.colors.black };
	color-scheme: light;
	box-shadow: 0 1px 2px rgba(22, 40, 69, 0.08);
`
