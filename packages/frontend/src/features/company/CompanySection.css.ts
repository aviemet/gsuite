import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const section = css`
	border: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[1] });
	border-radius: ${ vars.radius.md };
	box-shadow: 0 1px 3px light-dark(rgb(0 0 0 / 8%), rgb(0 0 0 / 35%));
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[7] });
`
