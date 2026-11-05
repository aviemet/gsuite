import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const scroller = css`
	max-height: 320px;
	margin-top: ${ vars.spacing.xs };
	overflow: auto;
	border: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[3] });
	border-radius: ${ vars.radius.md };
`

export const canvas = css`
	position: relative;
`

export const row = css`
	position: absolute;
	top: 0;
	left: 0;
	height: 52px;
	padding: 0 12px;

	&:hover {
		background: light-dark(${ vars.colors.gray[1] }, ${ vars.colors.dark[5] });
	}
`

export const status = css`
	margin-top: ${ vars.spacing.xs };
	padding: 4px 2px;
`
