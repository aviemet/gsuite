import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const shell = css`
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background:
		radial-gradient(ellipse at top left, ${ vars.colors.harbor[2] } 0%, transparent 50%),
		radial-gradient(ellipse at bottom right, ${ vars.colors.copper[1] } 0%, transparent 45%),
		light-dark(#eef2f8, ${ vars.colors.dark[8] });
	color: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.gray[0] });
`

export const header = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${ vars.spacing.md };
	padding: ${ vars.spacing.md } ${ vars.spacing.xl };
	border-bottom: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
	background: light-dark(rgba(255, 255, 255, 0.72), rgba(26, 27, 30, 0.72));
	backdrop-filter: blur(8px);
	position: sticky;
	top: 0;
	z-index: 10;
`

export const brand = css`
	display: inline-flex;
	align-items: center;
	gap: ${ vars.spacing.sm };
	text-decoration: none;
	color: inherit;
`

export const brandMark = css`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	border-radius: ${ vars.radius.sm };
	background: ${ vars.colors.harbor[9] };
	color: ${ vars.colors.copper[4] };
`

export const brandName = css`
	font-size: 1.125rem;
	font-weight: 650;
	letter-spacing: -0.02em;
`

export const main = css`
	flex: 1;
	width: 100%;
`

export const footer = css`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: ${ vars.spacing.md };
	padding: ${ vars.spacing.xl };
	border-top: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
	color: light-dark(${ vars.colors.gray[7] }, ${ vars.colors.dark[1] });
	font-size: 0.875rem;
`

export const footerLinks = css`
	display: flex;
	flex-wrap: wrap;
	gap: ${ vars.spacing.md };
`

export const footerLink = css`
	color: inherit;
	text-decoration: none;

	&:hover {
		color: light-dark(${ vars.colors.harbor[8] }, ${ vars.colors.harbor[3] });
		text-decoration: underline;
	}
`
