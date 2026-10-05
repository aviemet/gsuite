import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const panel = css`
	border: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[1] });
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[6] });
	box-shadow: 0 1px 2px rgba(22, 40, 69, 0.05);
`

export const heading = css`
	color: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.gray[1] });
	font-weight: 650;
`

export const card = css`
	display: flex;
	align-items: center;
	gap: ${ vars.spacing.sm };
	width: 100%;
	padding: ${ vars.spacing.sm } ${ vars.spacing.md };
	border: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[1] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.gray[0] }, ${ vars.colors.dark[7] });
	text-align: left;
	cursor: pointer;

	&:focus-visible {
		outline: 2px solid light-dark(${ vars.colors.harbor[8] }, ${ vars.colors.harbor[2] });
		outline-offset: 2px;
	}

	&:hover {
		border-color: ${ vars.colors.harbor[4] };
		background: light-dark(${ vars.colors.harbor[0] }, ${ vars.colors.dark[5] });
	}
`

export const cardIconWell = css`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	width: 1.75rem;
	height: 1.75rem;
	border-radius: ${ vars.radius.sm };
	background: light-dark(${ vars.colors.harbor[1] }, ${ vars.colors.harbor[9] });
	color: light-dark(${ vars.colors.harbor[8] }, ${ vars.colors.harbor[2] });
`

export const cardBody = css`
	flex: 1;
	min-width: 0;
`

export const cardChevron = css`
	flex-shrink: 0;
	color: light-dark(${ vars.colors.gray[7] }, ${ vars.colors.dark[0] });
`

export const cardInserted = css`
	color: light-dark(${ vars.colors.harbor[7] }, ${ vars.colors.harbor[2] });
`
