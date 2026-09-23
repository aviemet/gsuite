import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const stepIcon = css`
	[data-mantine-color-scheme="light"] & {
		background-color: ${ vars.colors.white };
		border-color: ${ vars.colors.gray[4] };
		color: ${ vars.colors.harbor[8] };
	}

	[data-mantine-color-scheme="light"] &[data-progress] {
		border-color: ${ vars.colors.harbor[7] };
		color: ${ vars.colors.harbor[8] };
	}

	[data-mantine-color-scheme="light"] &[data-completed] {
		background-color: ${ vars.colors.harbor[7] };
		border-color: ${ vars.colors.harbor[7] };
		color: ${ vars.colors.white };
	}
`
