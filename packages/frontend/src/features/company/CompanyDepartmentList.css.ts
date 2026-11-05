import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const rows = css`
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	column-gap: ${ vars.spacing.xs };
	row-gap: ${ vars.spacing.xs };
	align-items: center;
`

export const name = css`
	grid-column: 1;
`

export const remove = css`
	grid-column: 2;
`
