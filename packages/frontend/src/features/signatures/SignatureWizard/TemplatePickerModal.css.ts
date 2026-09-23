import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const shell = css`
	display: flex;
	flex-direction: column;
	gap: ${ vars.spacing.md };
	min-height: 24rem;

	@media (min-width: 48em) {
		flex-direction: row;
		align-items: stretch;
		min-height: 28rem;
	}
`

export const sidebar = css`
	display: flex;
	flex-direction: column;
	gap: ${ vars.spacing.sm };
	min-width: 0;

	@media (min-width: 48em) {
		width: 17rem;
		flex-shrink: 0;
		border-right: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
		padding-right: ${ vars.spacing.md };
	}
`

export const templateList = css`
	overflow: auto;
	flex: 1;
	min-height: 12rem;
	max-height: 22rem;
`

export const groupToggle = css`
	display: flex;
	align-items: center;
	gap: ${ vars.spacing.xs };
	width: 100%;
	padding: ${ vars.spacing.xs } ${ vars.spacing.xxs };
	border: 0;
	background: transparent;
	color: inherit;
	font: inherit;
	text-align: left;
	cursor: pointer;
`

export const templateButton = css`
	display: flex;
	align-items: center;
	gap: ${ vars.spacing.sm };
	width: 100%;
	padding: ${ vars.spacing.xs } ${ vars.spacing.sm };
	border: 0;
	border-radius: ${ vars.radius.sm };
	background: transparent;
	color: inherit;
	font: inherit;
	text-align: left;
	cursor: pointer;

	&:hover {
		background: light-dark(${ vars.colors.gray[0] }, ${ vars.colors.dark[5] });
	}

	&[data-selected="true"] {
		background: light-dark(${ vars.colors.harbor[0] }, ${ vars.colors.dark[4] });
		color: light-dark(${ vars.colors.harbor[8] }, ${ vars.colors.harbor[2] });
	}
`

export const previewPane = css`
	display: flex;
	flex-direction: column;
	gap: ${ vars.spacing.sm };
	flex: 1;
	min-width: 0;
`

export const previewCanvas = css`
	flex: 1;
	min-height: 16rem;
	overflow: auto;
`
