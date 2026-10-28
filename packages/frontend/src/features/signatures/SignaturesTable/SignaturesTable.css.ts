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

	:global(.mantine-datatable-row td) {
		border-bottom-color: light-dark(${ vars.colors.gray[5] }, ${ vars.colors.dark[4] });
	}

	:global(.mantine-datatable-row-expansion-cell),
	:global(.mantine-datatable-row-expansion-cell-content) {
		background-color: light-dark(${ vars.colors.gray[0] }, ${ vars.colors.dark[6] });
		border-bottom: none;
		padding: 0;
	}

	:global(tr:has(.mantine-datatable-row-expansion-cell) + tr td),
	:global(.mantine-datatable-row:has(+ tr:has(.mantine-datatable-row-expansion-cell)) td) {
		border-bottom: none;
	}
`

export const expansion = css`
	padding: ${ vars.spacing.sm } ${ vars.spacing.md } ${ vars.spacing.md };
`

export const previewFrame = css`
	width: fit-content;
	max-width: 100%;
	overflow: visible;
	pointer-events: none;
	padding: ${ vars.spacing.md };
	border-radius: ${ vars.radius.md };
	background-color: #ffffff;
	color: #000000;
	color-scheme: light;
`

export const previewContent = css`
	font-size: 0.875rem;
	line-height: 1.4;

	p {
		margin: 0;
	}

	p + p {
		margin-top: 0.25rem;
	}
`

export const expandIcon = css`
	transition: transform 150ms ease;
`

export const expandIconExpanded = css`
	transform: rotate(180deg);
`

export const actionsCell = css`
	white-space: nowrap;
	width: 1%;
`
