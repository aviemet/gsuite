import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const choice = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	width: 100%;
	box-sizing: border-box;
	border: 0;
	background: transparent;
	color: inherit;
	font: inherit;
	text-align: left;
	cursor: pointer;

	&:disabled {
		cursor: default;
		opacity: 0.6;
	}

	&:focus-visible {
		outline: 2px solid ${ vars.colors.harbor[5] };
		outline-offset: -2px;
	}
`

export const identity = css`
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 0;
`

export const name = css`
	overflow: hidden;
	font-weight: 650;
	text-overflow: ellipsis;
	white-space: nowrap;
`

export const email = css`
	overflow: hidden;
	color: light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[2] });
	font-size: ${ vars.fontSizes.sm };
	font-weight: 400;
	text-overflow: ellipsis;
	white-space: nowrap;
`

export const iconAction = css`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 1.75rem;
	height: 1.75rem;
	border: 1px solid light-dark(${ vars.colors.harbor[6] }, ${ vars.colors.harbor[4] });
	border-radius: ${ vars.radius.sm };
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[7] });
	color: light-dark(${ vars.colors.harbor[8] }, ${ vars.colors.harbor[2] });
`
