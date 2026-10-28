import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const paneCard = css`
	display: flex;
	flex-direction: column;
	gap: ${ vars.spacing.sm };
	height: 100%;
	padding: ${ vars.spacing.md };
	border: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[1] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[6] });
	box-shadow: 0 1px 3px rgba(22, 40, 69, 0.08);
`

export const paneHeader = css`
	min-height: 2rem;
`

export const paneTitle = css`
	color: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.gray[1] });
	font-weight: 650;
`

export const composeShell = css`
	overflow: hidden;
	border: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[5] });
`

export const composeTitleBar = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${ vars.spacing.sm };
	padding: 0.55rem 0.85rem;
	background: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.dark[7] });
	color: ${ vars.colors.gray[0] };
	font-size: 0.8125rem;
	font-weight: 600;
	letter-spacing: -0.01em;
`

export const composeMeta = css`
	display: grid;
	gap: 0;
	border-bottom: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[5] });
`

export const composeMetaRow = css`
	display: grid;
	grid-template-columns: 4.5rem 1fr;
	align-items: baseline;
	gap: ${ vars.spacing.xs };
	padding: 0.55rem 0.85rem;
	border-bottom: 1px solid light-dark(${ vars.colors.gray[2] }, ${ vars.colors.dark[4] });
	font-size: 0.8125rem;
	color: light-dark(${ vars.colors.gray[8] }, ${ vars.colors.gray[3] });

	&:last-child {
		border-bottom: none;
	}
`

export const composeMetaLabel = css`
	color: light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[1] });
	font-weight: 500;
`

export const composeBody = css`
	min-height: 14rem;
	background: ${ vars.colors.white };
	color-scheme: light;
`

export const previewShell = css`
	overflow: hidden;
	border: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.gray[0] }, ${ vars.colors.dark[7] });
`

export const previewMeta = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${ vars.spacing.sm };
	flex-wrap: wrap;
	padding: 0.65rem 0.85rem;
	border-bottom: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[6] });
`

export const previewMetaPrimary = css`
	display: flex;
	flex-direction: column;
	gap: 0.1rem;
	min-width: 0;
`

export const previewSender = css`
	color: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.gray[1] });
	font-size: 0.8125rem;
	font-weight: 650;
	letter-spacing: -0.01em;
`

export const previewEmail = css`
	color: light-dark(${ vars.colors.gray[7] }, ${ vars.colors.gray[4] });
	font-size: 0.75rem;
`

export const previewBadge = css`
	flex-shrink: 0;
	color: light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[1] });
	font-size: 0.75rem;
	font-weight: 500;
`

export const previewSheet = css`
	min-height: 16rem;
	padding: ${ vars.spacing.md };
	background: ${ vars.colors.white };
	color: ${ vars.colors.black };
	color-scheme: light;
`
