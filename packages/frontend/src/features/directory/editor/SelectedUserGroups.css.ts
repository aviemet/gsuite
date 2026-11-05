import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const panel = css`
	border: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[3] });
	border-left: 4px solid light-dark(${ vars.colors.harbor[6] }, ${ vars.colors.harbor[4] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.harbor[0] }, ${ vars.colors.dark[6] });
	overflow: hidden;
`

export const header = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${ vars.spacing.xs };
	min-height: 2.5rem;
	padding: 8px 12px;
	border-bottom: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[3] });
`

export const heading = css`
	margin: 0;
	font-weight: 650;
	color: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.harbor[1] });
`

export const list = css`
	position: relative;
	max-height: 260px;
	margin: 0;
	padding: 4px;
	overflow: auto;
	list-style: none;
`

export const item = css`
	margin: 0;
	padding: 0;
`

export const controls = css`
	display: flex;
	align-items: center;
	flex: none;
	gap: 4px;
`

export const row = css`
	@keyframes user-group-selected-arrive {
		from {
			background-color: light-dark(${ vars.colors.harbor[2] }, ${ vars.colors.harbor[8] });
		}

		to {
			background-color: transparent;
		}
	}

	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	width: 100%;
	box-sizing: border-box;
	min-height: 52px;
	padding: 6px 8px 6px 12px;
	border-radius: ${ vars.radius.sm };

	&:hover {
		background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[5] });
	}

	&[data-just-added="true"] {
		animation: user-group-selected-arrive 900ms ease;
	}

	@media (prefers-reduced-motion: reduce) {
		&[data-just-added="true"] {
			animation: none;
		}
	}
`

export const empty = css`
	padding: 12px;
`
