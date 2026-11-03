import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const document = css`
	width: min(44rem, calc(100% - 2 * ${ vars.spacing.xl }));
	margin: 0 auto;
	padding: ${ vars.spacing.xxl } 0;
	display: flex;
	flex-direction: column;
	gap: ${ vars.spacing.lg };
`

export const title = css`
	font-size: clamp(1.75rem, 3vw, 2.25rem);
	font-weight: 700;
	letter-spacing: -0.03em;
	line-height: 1.15;
`

export const meta = css`
	font-size: 0.95rem;
	color: light-dark(${ vars.colors.gray[7] }, ${ vars.colors.dark[0] });
`

export const section = css`
	display: flex;
	flex-direction: column;
	gap: ${ vars.spacing.sm };
`

export const heading = css`
	font-size: 1.15rem;
	font-weight: 650;
	letter-spacing: -0.02em;
`

export const paragraph = css`
	font-size: 1rem;
	line-height: 1.6;
	color: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.gray[1] });
`

export const list = css`
	margin: 0;
	padding-left: 1.25rem;
	display: flex;
	flex-direction: column;
	gap: ${ vars.spacing.xs };
	font-size: 1rem;
	line-height: 1.6;
`
