import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const scroller = css`
	height: 320px;
	overflow: auto;
	border: 1px solid light-dark(${ vars.colors.gray[4] }, ${ vars.colors.dark[4] });
	border-radius: ${ vars.radius.md };
`

export const row = css`
	position: absolute;
	left: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	width: 100%;
	height: 52px;
	padding: 0 12px;
	border: 0;
	background: transparent;
	color: inherit;
	text-align: left;
	cursor: pointer;

	&[aria-pressed="true"] {
		background-color: light-dark(${ vars.colors.gray[1] }, ${ vars.colors.dark[5] });
	}

	&:disabled {
		cursor: default;
	}
`

export const identity = css`
	display: flex;
	flex-direction: column;
	min-width: 0;
`

export const email = css`
	color: light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[2] });
	font-size: ${ vars.fontSizes.sm };
`
