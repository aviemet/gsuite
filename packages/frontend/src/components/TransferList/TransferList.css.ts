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
	display: flex;
	flex-direction: column;
	border: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[1] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[7] });
	overflow: hidden;
`

export const header = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${ vars.spacing.xs };
	min-height: 2.5rem;
	padding: 6px 10px;
	border-bottom: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
	background: light-dark(${ vars.colors.gray[0] }, ${ vars.colors.dark[6] });

	[data-type="chosen"] & {
		background: light-dark(${ vars.colors.harbor[0] }, ${ vars.colors.harbor[9] });
	}
`

export const heading = css`
	font-weight: 650;
	color: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.gray[1] });
`

export const search = css`
	border: 0;
	border-bottom: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
	border-radius: 0;
`

export const list = css`
	padding: ${ vars.spacing.xxs };
	min-height: 220px;
	max-height: 280px;
	overflow: auto;
`

export const item = css`
	display: flex;
	align-items: center;
	gap: ${ vars.spacing.xs };
	width: 100%;
	padding: 4px 6px;
	border: 0;
	border-radius: ${ vars.radius.sm };
	background: transparent;
	color: light-dark(${ vars.colors.gray[8] }, ${ vars.colors.gray[2] });
	text-align: left;
	cursor: pointer;

	&:hover {
		background: light-dark(${ vars.colors.gray[1] }, ${ vars.colors.dark[5] });
	}

	&:hover [data-action] {
		background: light-dark(${ vars.colors.harbor[1] }, ${ vars.colors.harbor[8] });
		border-color: light-dark(${ vars.colors.harbor[5] }, ${ vars.colors.harbor[4] });
	}

	&:focus-visible {
		outline: 2px solid ${ vars.colors.harbor[5] };
		outline-offset: 1px;
	}
`

export const itemLabel = css`
	flex: 1;
	min-width: 0;
`

export const itemAction = css`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	width: 1.625rem;
	height: 1.625rem;
	border: 1px solid light-dark(${ vars.colors.harbor[3] }, ${ vars.colors.harbor[7] });
	border-radius: ${ vars.radius.sm };
	background: light-dark(${ vars.colors.white }, ${ vars.colors.harbor[9] });
	color: light-dark(${ vars.colors.harbor[8] }, ${ vars.colors.harbor[2] });
`

export const empty = css`
	padding: ${ vars.spacing.sm };
`
