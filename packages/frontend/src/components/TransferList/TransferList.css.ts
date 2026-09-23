import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const root = css`
	display: flex;
	gap: ${ vars.spacing.md };

	@media (max-width: 47.9375em) {
		flex-direction: column;
	}
`

export const panel = css`
	flex: 1;
	min-width: 0;
`

export const controls = css`
	[data-type="backward"] & {
		flex-direction: row-reverse;
	}
`

export const list = css`
	background-color: light-dark(${ vars.colors.white }, ${ vars.colors.dark[7] });
	padding: ${ vars.spacing.xs } 6px;
	border: 1px solid light-dark(${ vars.colors.gray[4] }, ${ vars.colors.dark[4] });
	border-top: 0;
	border-bottom-left-radius: ${ vars.radius.md };
	border-bottom-right-radius: ${ vars.radius.md };
	min-height: 224px;
	max-height: 280px;
	overflow: auto;
`

export const input = css`
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;

	[data-type="backward"] & {
		border-left: 0;
		border-top-left-radius: 0;
	}

	[data-type="forward"] & {
		border-right: 0;
		border-top-right-radius: 0;
	}
`

export const control = css`
	color: light-dark(${ vars.colors.gray[7] }, ${ vars.colors.dark[1] });

	[data-type="backward"] & {
		border-top-left-radius: ${ vars.radius.sm };
	}

	[data-type="forward"] & {
		border-top-right-radius: ${ vars.radius.sm };
	}
`

export const icon = css`
	width: 18px;
	height: 18px;

	[data-type="backward"] & {
		transform: rotate(180deg);
	}
`
