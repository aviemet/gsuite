import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const page = css`
	display: flex;
	flex-direction: column;
`

export const section = css`
	width: min(68rem, calc(100% - 2 * ${ vars.spacing.xl }));
	margin: 0 auto;
	padding: ${ vars.spacing.xxl } 0;
`

export const hero = css`
	display: grid;
	gap: ${ vars.spacing.xl };
	align-items: center;
	padding-top: calc(${ vars.spacing.xxl } * 1.25);

	@media (min-width: 56em) {
		grid-template-columns: 1.1fr 0.9fr;
	}
`

export const heroCopy = css`
	display: flex;
	flex-direction: column;
	gap: ${ vars.spacing.md };
	max-width: 36rem;
`

export const brandLead = css`
	font-size: clamp(2.5rem, 5vw, 3.75rem);
	font-weight: 700;
	letter-spacing: -0.04em;
	line-height: 1.05;
	color: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.gray[0] });
`

export const headline = css`
	font-size: clamp(1.35rem, 2.4vw, 1.75rem);
	font-weight: 550;
	letter-spacing: -0.02em;
	line-height: 1.3;
	color: light-dark(${ vars.colors.harbor[8] }, ${ vars.colors.gray[2] });
`

export const supporting = css`
	font-size: 1.05rem;
	line-height: 1.55;
	color: light-dark(${ vars.colors.gray[7] }, ${ vars.colors.dark[0] });
	max-width: 34rem;
`

export const actions = css`
	display: flex;
	flex-wrap: wrap;
	gap: ${ vars.spacing.sm };
	margin-top: ${ vars.spacing.xs };
`

export const preview = css`
	border: 1px solid light-dark(${ vars.colors.gray[4] }, ${ vars.colors.dark[4] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[7] });
	padding: ${ vars.spacing.lg };
	box-shadow: ${ vars.shadows.sm };
`

export const previewLabel = css`
	font-size: 0.75rem;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[1] });
	margin-bottom: ${ vars.spacing.sm };
`

export const previewBody = css`
	font-size: 0.95rem;
	line-height: 1.5;
	color: light-dark(${ vars.colors.harbor[9] }, ${ vars.colors.gray[1] });
`

export const previewName = css`
	font-weight: 650;
`

export const previewMeta = css`
	color: light-dark(${ vars.colors.gray[7] }, ${ vars.colors.dark[0] });
`

export const previewRule = css`
	height: 2px;
	width: 3rem;
	background: ${ vars.colors.copper[5] };
	margin: ${ vars.spacing.sm } 0;
`

export const sectionHeading = css`
	font-size: clamp(1.5rem, 2.5vw, 2rem);
	font-weight: 650;
	letter-spacing: -0.03em;
	margin-bottom: ${ vars.spacing.xs };
`

export const sectionSupport = css`
	font-size: 1rem;
	line-height: 1.5;
	color: light-dark(${ vars.colors.gray[7] }, ${ vars.colors.dark[0] });
	max-width: 40rem;
	margin-bottom: ${ vars.spacing.xl };
`

export const featureGrid = css`
	display: grid;
	gap: ${ vars.spacing.lg };

	@media (min-width: 48em) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
`

export const feature = css`
	display: flex;
	flex-direction: column;
	gap: ${ vars.spacing.xs };
`

export const featureTitle = css`
	font-size: 1.125rem;
	font-weight: 650;
	letter-spacing: -0.02em;
`

export const featureBody = css`
	font-size: 0.975rem;
	line-height: 1.55;
	color: light-dark(${ vars.colors.gray[7] }, ${ vars.colors.dark[0] });
`

export const steps = css`
	display: grid;
	gap: ${ vars.spacing.lg };

	@media (min-width: 48em) {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
`

export const step = css`
	display: flex;
	flex-direction: column;
	gap: ${ vars.spacing.xs };
`

export const stepNumber = css`
	font-size: 0.8rem;
	font-weight: 650;
	letter-spacing: 0.04em;
	text-transform: uppercase;
	color: ${ vars.colors.copper[7] };
`

export const trustList = css`
	display: flex;
	flex-direction: column;
	gap: ${ vars.spacing.md };
	max-width: 44rem;
	padding: 0;
	margin: 0;
	list-style: none;
`

export const trustItem = css`
	font-size: 1rem;
	line-height: 1.55;
	padding-left: ${ vars.spacing.md };
	border-left: 2px solid ${ vars.colors.harbor[5] };
`

export const closing = css`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: ${ vars.spacing.md };
	padding: ${ vars.spacing.xxl } 0 calc(${ vars.spacing.xxl } * 1.5);
`
