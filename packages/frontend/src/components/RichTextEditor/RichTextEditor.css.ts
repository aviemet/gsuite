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
		border-color: var(--mantine-color-dark-4);
		background-color: var(--mantine-color-dark-5);

		.tox .tox-toolbar-overlord,
		.tox .tox-toolbar,
		.tox .tox-toolbar__primary,
		.tox .tox-toolbar__overflow {
			background: transparent;
			background-image: none;
		}

		.tox.tox-tinymce:not(.tox-tinymce-inline) .tox-editor-header {
			background-color: var(--mantine-color-dark-5);
			border-bottom: 1px solid var(--mantine-color-dark-4);
			border-radius: var(--mantine-radius-md) var(--mantine-radius-md) 0 0;
			padding: 0.35rem 0.45rem 0.1rem;
		}

		.tox .tox-toolbar__group {
			border: 1px solid var(--mantine-color-dark-3);
			background: transparent;
			box-shadow: none;
			overflow: hidden;
			margin: 0 0.375rem 0.25rem 0;
			padding: 0;
		}

		.tox:not([dir="rtl"]) .tox-toolbar__group:not(:last-of-type),
		.tox[dir="rtl"] .tox-toolbar__group:not(:last-of-type) {
			border-inline-end: 1px solid var(--mantine-color-dark-3);
			padding-inline-end: 0;
			padding-inline-start: 0;
		}

		.tox .tox-toolbar__group > .tox-tbtn,
		.tox .tox-toolbar__group > .tox-split-button,
		.tox .tox-split-button .tox-tbtn {
			border: none;
			border-radius: 0;
			margin: 0;
			border-inline-end: 1px solid var(--mantine-color-dark-3);
		}

		.tox .tox-toolbar__group > .tox-tbtn:last-child,
		.tox .tox-toolbar__group > .tox-split-button:last-child,
		.tox .tox-split-button .tox-tbtn:last-child {
			border-inline-end: none;
		}

		.tox .tox-tbtn,
		.tox .tox-tbtn--bespoke,
		.tox .tox-tbtn--bespoke:focus,
		.tox .tox-tbtn:focus,
		.tox .tox-split-button__chevron,
		.tox .tox-split-button__chevron:focus,
		.tox .tox-tbtn--disabled,
		.tox .tox-tbtn--disabled:hover,
		.tox .tox-tbtn:disabled,
		.tox .tox-tbtn:disabled:hover {
			background: transparent;
			color: var(--mantine-color-gray-1);
			box-shadow: none;
		}

		.tox .tox-tbtn svg path:not(.tox-icon-text-color__color):not(.tox-icon-highlight-bg-color__color),
		.tox .tox-tbtn__select-chevron svg,
		.tox .tox-split-button__chevron svg {
			fill: var(--mantine-color-gray-1);
		}

		.tox .tox-icon-text-color__color {
			fill: var(--mantine-color-gray-1);
		}

		.tox .tox-icon-highlight-bg-color__color {
			stroke: var(--mantine-color-gray-1);
			stroke-width: 1px;
		}

		.tox .tox-tbtn--disabled,
		.tox .tox-tbtn--disabled:hover,
		.tox .tox-tbtn:disabled,
		.tox .tox-tbtn:disabled:hover {
			color: var(--mantine-color-gray-5);
		}

		.tox .tox-tbtn--disabled svg path:not(.tox-icon-text-color__color):not(.tox-icon-highlight-bg-color__color),
		.tox .tox-tbtn--disabled:hover svg path:not(.tox-icon-text-color__color):not(.tox-icon-highlight-bg-color__color),
		.tox .tox-tbtn:disabled svg path:not(.tox-icon-text-color__color):not(.tox-icon-highlight-bg-color__color) {
			fill: var(--mantine-color-gray-5);
		}

		.tox .tox-tbtn:hover,
		.tox .tox-tbtn:active,
		.tox .tox-split-button__chevron:hover,
		.tox .tox-tbtn--enabled,
		.tox .tox-tbtn--enabled:hover,
		.tox .tox-tbtn--enabled:focus,
		.tox .tox-tbtn--active {
			background: rgba(255, 255, 255, 0.1);
			color: var(--mantine-color-white);
		}

		.tox .tox-tbtn:hover svg path:not(.tox-icon-text-color__color):not(.tox-icon-highlight-bg-color__color),
		.tox .tox-tbtn:active svg path:not(.tox-icon-text-color__color):not(.tox-icon-highlight-bg-color__color),
		.tox .tox-tbtn--enabled svg path:not(.tox-icon-text-color__color):not(.tox-icon-highlight-bg-color__color),
		.tox .tox-tbtn--active svg path:not(.tox-icon-text-color__color):not(.tox-icon-highlight-bg-color__color) {
			fill: var(--mantine-color-white);
		}
	}
`
