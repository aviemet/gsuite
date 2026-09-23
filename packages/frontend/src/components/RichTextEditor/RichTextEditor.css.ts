import { css } from "@linaria/core"

export const editor = css`
	border: 1px solid var(--mantine-color-gray-4);
	border-radius: var(--mantine-radius-md);
	background-color: #ffffff;
	color: #000000;
	color-scheme: light;
	overflow: visible;
	min-height: 16rem;
	box-shadow: 0 1px 2px rgba(22, 40, 69, 0.06);

	.tox-tinymce {
		border: none;
		border-radius: 0;
	}

	.tox .tox-edit-area__iframe {
		background-color: #ffffff;
	}

	.tox.tox-tinymce:not(.tox-tinymce-inline) .tox-editor-header {
		padding: 0.5rem 0.5rem 0.25rem;
		box-shadow: none;
		border-bottom: 1px solid var(--mantine-color-default-border);
	}

	.tox .tox-toolbar,
	.tox .tox-toolbar__primary,
	.tox .tox-toolbar__overflow {
		background: transparent;
	}

	.tox .tox-toolbar__group {
		gap: 0;
		margin: 0 0.375rem 0.25rem 0;
		padding: 0;
		border: 1px solid var(--mantine-color-default-border);
		border-radius: var(--mantine-radius-sm);
		overflow: hidden;
		background-color: #ffffff;
	}

	.tox:not([dir="rtl"]) .tox-toolbar__group:not(:last-of-type),
	.tox[dir="rtl"] .tox-toolbar__group:not(:last-of-type) {
		border-inline-end: 1px solid var(--mantine-color-default-border);
	}

	.tox .tox-toolbar__group > .tox-tbtn {
		margin: 0;
		border-radius: 0;
		border-inline-end: 1px solid var(--mantine-color-default-border);
	}

	.tox .tox-toolbar__group > .tox-tbtn:last-child {
		border-inline-end: none;
	}

	:root[data-mantine-color-scheme="dark"] & {
		.tox.tox-tinymce:not(.tox-tinymce-inline) .tox-editor-header {
			background-color: var(--mantine-color-dark-4);
			border-bottom-color: var(--mantine-color-dark-3);
			border-radius: var(--mantine-radius-md) var(--mantine-radius-md) 0 0;
		}

		.tox .tox-toolbar__group {
			background-color: var(--mantine-color-dark-4);
			border-color: var(--mantine-color-dark-3);
		}

		.tox:not([dir="rtl"]) .tox-toolbar__group:not(:last-of-type),
		.tox[dir="rtl"] .tox-toolbar__group:not(:last-of-type),
		.tox .tox-toolbar__group > .tox-tbtn {
			border-inline-end-color: var(--mantine-color-dark-3);
		}

		.tox .tox-tbtn,
		.tox .tox-tbtn--bespoke,
		.tox .tox-tbtn--bespoke:focus,
		.tox .tox-tbtn:focus,
		.tox .tox-tbtn--disabled,
		.tox .tox-tbtn--disabled:hover,
		.tox .tox-tbtn:disabled,
		.tox .tox-tbtn:disabled:hover {
			background: transparent;
			color: var(--mantine-color-gray-3);
		}

		.tox .tox-tbtn svg,
		.tox .tox-tbtn__select-chevron svg {
			fill: var(--mantine-color-gray-3);
		}

		.tox .tox-tbtn--disabled svg,
		.tox .tox-tbtn--disabled:hover svg,
		.tox .tox-tbtn:disabled svg,
		.tox .tox-tbtn:disabled:hover svg {
			fill: var(--mantine-color-dark-2);
		}

		.tox .tox-tbtn:hover,
		.tox .tox-tbtn:active,
		.tox .tox-tbtn--enabled,
		.tox .tox-tbtn--enabled:hover,
		.tox .tox-tbtn--enabled:focus,
		.tox .tox-tbtn--active {
			background: var(--mantine-color-dark-3);
			color: var(--mantine-color-gray-1);
		}

		.tox .tox-tbtn:hover svg,
		.tox .tox-tbtn:active svg,
		.tox .tox-tbtn--enabled svg,
		.tox .tox-tbtn--active svg {
			fill: var(--mantine-color-gray-1);
		}
	}
`
