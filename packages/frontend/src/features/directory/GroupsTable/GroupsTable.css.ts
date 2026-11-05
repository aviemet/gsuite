import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const table = css`
	background-color: light-dark(${ vars.colors.gray[0] }, ${ vars.colors.dark[6] });
	border: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[4] });
	border-radius: ${ vars.radius.md };
	overflow: hidden;
	box-shadow: ${ vars.shadows.xs };

	:global(.mantine-datatable-header) {
		background-color: light-dark(${ vars.colors.gray[2] }, ${ vars.colors.dark[5] });
		border-bottom: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[4] });
	}

	:global(th[data-pinned]) {
		background-color: light-dark(${ vars.colors.gray[2] }, ${ vars.colors.dark[5] });
	}

	:global(td[data-pinned]) {
		background-color: light-dark(${ vars.colors.gray[0] }, ${ vars.colors.dark[6] });
	}

	:global(.mantine-datatable-row:hover td[data-pinned]) {
		background-color: light-dark(${ vars.colors.gray[1] }, ${ vars.colors.dark[5] });
	}

	:global(.mantine-datatable-row td) {
		border-bottom-color: light-dark(${ vars.colors.gray[5] }, ${ vars.colors.dark[4] });
	}
`
