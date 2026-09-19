import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const sourceCard = css`
	position: relative;
	height: 100%;
	padding: ${ vars.spacing.md };
	border: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[6] });
	cursor: pointer;
	transition: border-color 150ms ease, background 150ms ease;

	&[data-checked] {
		border-color: ${ vars.colors.blue[5] };
		background: light-dark(${ vars.colors.blue[0] }, ${ vars.colors.dark[5] });
	}

	&:hover {
		border-color: ${ vars.colors.blue[4] };
	}
`

export const sourcePreview = css`
	max-height: 16rem;
	overflow: auto;
`
