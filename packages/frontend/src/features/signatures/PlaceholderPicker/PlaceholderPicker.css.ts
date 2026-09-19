import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const card = css`
	display: flex;
	align-items: center;
	gap: ${ vars.spacing.sm };
	width: 100%;
	padding: ${ vars.spacing.sm } ${ vars.spacing.md };
	border: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[6] });
	text-align: left;
	cursor: pointer;

	&:hover {
		border-color: ${ vars.colors.blue[4] };
		background: light-dark(${ vars.colors.gray[0] }, ${ vars.colors.dark[5] });
	}
`

export const cardIcon = css`
	flex-shrink: 0;
	color: ${ vars.colors.gray[6] };
`

export const cardBody = css`
	flex: 1;
	min-width: 0;
`

export const cardChevron = css`
	flex-shrink: 0;
	color: ${ vars.colors.gray[5] };
`

export const cardInserted = css`
	color: ${ vars.colors.teal[7] };
`
