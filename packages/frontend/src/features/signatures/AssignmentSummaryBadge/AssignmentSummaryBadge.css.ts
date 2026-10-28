import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const tooltip = css`
	padding: ${ vars.spacing.sm } !important;
	border-radius: ${ vars.radius.md };
	box-shadow: ${ vars.shadows.sm };
	background-color: light-dark(${ vars.colors.white }, ${ vars.colors.dark[6] }) !important;
	color: light-dark(${ vars.colors.black }, ${ vars.colors.gray[0] }) !important;
	--tooltip-bg: light-dark(${ vars.colors.white }, ${ vars.colors.dark[6] });
	border: 1px solid light-dark(${ vars.colors.gray[4] }, ${ vars.colors.dark[4] });
`
