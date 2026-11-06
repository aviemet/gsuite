import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const table = css`
	background-color: light-dark(${ vars.colors.gray[0] }, ${ vars.colors.dark[6] });
	border: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[4] });
	border-radius: ${ vars.radius.md };
	overflow: hidden;
	box-shadow: ${ vars.shadows.xs };

	:global(th),
	:global(td) {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.mantine-datatable-header) {
		background-color: light-dark(${ vars.colors.gray[2] }, ${ vars.colors.dark[5] });
		border-bottom: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[4] });
	}

	:global(th[data-pinned]) {
		background-color: light-dark(${ vars.colors.gray[2] }, ${ vars.colors.dark[5] });
	}

	:global(tbody .mantine-datatable-row td) {
		background-color: light-dark(${ vars.colors.gray[0] }, ${ vars.colors.dark[6] });
	}

	:global(table[data-striped] tbody tr:nth-of-type(odd) td) {
		background-color: var(--mantine-datatable-striped-color);
	}

	:global(table[data-highlight-on-hover] tbody tr:hover td),
	:global(table[data-highlight-on-hover] tbody .mantine-datatable-row:hover td[data-pinned]) {
		background-color: var(--mantine-datatable-highlight-on-hover-color);
	}

	:global(.mantine-datatable-row td) {
		border-bottom-color: light-dark(${ vars.colors.gray[5] }, ${ vars.colors.dark[4] });
	}
`
