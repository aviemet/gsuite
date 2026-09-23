import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const defaultCard = css`
	transition: border-color 150ms ease, background 150ms ease;

	&[data-checked="true"] {
		border-color: ${ vars.colors.harbor[5] };
		background: light-dark(${ vars.colors.harbor[0] }, ${ vars.colors.dark[6] });
	}
`
