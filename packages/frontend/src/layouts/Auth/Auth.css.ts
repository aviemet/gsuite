import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const shell = css`
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: ${ vars.spacing.md };
	background:
		radial-gradient(ellipse at top left, ${ vars.colors.harbor[2] } 0%, transparent 55%),
		radial-gradient(ellipse at bottom right, ${ vars.colors.copper[1] } 0%, transparent 50%),
		light-dark(#e4ebf4, ${ vars.colors.dark[8] });
`

export const panel = css`
	width: 100%;
	max-width: 26rem;
`

export const brand = css`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: ${ vars.spacing.sm };
	margin-bottom: ${ vars.spacing.lg };
`

export const brandMark = css`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	width: 2.25rem;
	height: 2.25rem;
	border-radius: ${ vars.radius.sm };
	background: ${ vars.colors.harbor[9] };
	color: ${ vars.colors.copper[4] };
`

export const brandName = css`
	font-size: 1.25rem;
	font-weight: 650;
	letter-spacing: -0.02em;
	color: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.gray[0] });
	line-height: 1.2;
`
