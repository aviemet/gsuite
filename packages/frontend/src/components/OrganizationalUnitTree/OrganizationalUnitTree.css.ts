import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const root = css`
	width: 100%;

	@media (min-width: 62em) {
		width: 50%;
	}
`

export const panel = css`
	border: 1px solid light-dark(${ vars.colors.gray[4] }, ${ vars.colors.dark[4] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[7] });
	overflow: hidden;
`

export const search = css`
	border: 0;
	border-bottom: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
	border-radius: 0;
`

export const tree = css`
	padding: ${ vars.spacing.xs };
	max-height: 280px;
	overflow: auto;
`

export const node = css`
	display: flex;
	align-items: center;
	gap: ${ vars.spacing.xxs };
	width: 100%;
	padding-block: 6px;
	padding-inline-end: 8px;
	border-radius: ${ vars.radius.sm };
	cursor: pointer;
	color: light-dark(${ vars.colors.gray[8] }, ${ vars.colors.gray[2] });

	&:hover {
		background: light-dark(${ vars.colors.gray[1] }, ${ vars.colors.dark[5] });
	}

	&[data-checked="true"] {
		background: light-dark(${ vars.colors.harbor[0] }, ${ vars.colors.harbor[9] });
		color: light-dark(${ vars.colors.harbor[8] }, ${ vars.colors.harbor[2] });
	}
`

export const chevron = css`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 18px;
	height: 18px;
	flex-shrink: 0;
	border: 0;
	padding: 0;
	background: transparent;
	color: inherit;
	cursor: pointer;
	border-radius: ${ vars.radius.xs };

	&:hover {
		background: light-dark(${ vars.colors.gray[2] }, ${ vars.colors.dark[4] });
	}
`

export const chevronIcon = css`
	width: 14px;
	height: 14px;
	transition: transform 120ms ease;

	[data-expanded="false"] & {
		transform: rotate(-90deg);
	}
`

export const chevronSpacer = css`
	width: 18px;
	height: 18px;
	flex-shrink: 0;
`

export const label = css`
	flex: 1;
	min-width: 0;
	font-size: ${ vars.fontSizes.sm };
	line-height: 1.4;
`

export const empty = css`
	padding: ${ vars.spacing.md };
	text-align: center;
	color: light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[2] });
	font-size: ${ vars.fontSizes.sm };
`
