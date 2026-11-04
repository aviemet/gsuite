import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const root = css`
	position: relative;
`

export const dropdown = css`
	position: absolute;
	top: calc(100% + ${ vars.spacing.xs });
	right: 0;
	z-index: 10;
	min-width: 12rem;
`
