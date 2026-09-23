import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const header = css`
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[7] });
	border-bottom: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });

	h1 {
		color: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.gray[0] });
		letter-spacing: -0.02em;
	}
`

export const navbar = css`
	background: light-dark(${ vars.colors.harbor[9] }, #0c1422);
	border-inline-end: 1px solid light-dark(${ vars.colors.harbor[8] }, #0c1422);
	color: ${ vars.colors.gray[0] };
`

export const brand = css`
	display: flex;
	align-items: center;
	gap: ${ vars.spacing.sm };
	padding: ${ vars.spacing.md } ${ vars.spacing.md } ${ vars.spacing.sm };
`

export const brandMark = css`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	width: 1.75rem;
	height: 1.75rem;
	border-radius: ${ vars.radius.sm };
	background: ${ vars.colors.copper[4] };
	color: ${ vars.colors.harbor[9] };
`

export const brandName = css`
	font-size: 0.95rem;
	font-weight: 650;
	letter-spacing: -0.02em;
	color: ${ vars.colors.gray[0] };
	line-height: 1.2;
`

export const navLink = css`
	--nl-bg: rgba(255, 255, 255, 0.1);
	--nl-hover: rgba(255, 255, 255, 0.14);
	--nl-color: ${ vars.colors.white };
	border-radius: ${ vars.radius.sm };
	color: ${ vars.colors.gray[3] };
	font-weight: 550;

	&:hover {
		background-color: rgba(255, 255, 255, 0.06);
		color: ${ vars.colors.white };
	}

	&[data-active] {
		box-shadow: inset 3px 0 0 ${ vars.colors.copper[4] };
		color: ${ vars.colors.white };
	}
`

export const main = css`
	background: light-dark(#e4ebf4, ${ vars.colors.dark[8] });
`
