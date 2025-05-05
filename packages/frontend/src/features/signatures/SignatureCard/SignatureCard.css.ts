import { css } from "@linaria/core"
import { vars } from "@/frontend/lib/theme"

export const cardRoot = css`
	position: relative;
`

export const editButton = css`
	padding: 4px;
	min-width: 0;
	color: ${ vars.colors.gray[3] };
	transition: color 0.15s, background 0.15s;

	&:hover {
		color: ${ vars.colors.blue[7] };
		background: ${ vars.colors.blue[0] };
	}
`
