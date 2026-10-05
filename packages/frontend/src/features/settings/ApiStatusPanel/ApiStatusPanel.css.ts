import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const summary = css`
	display: flex;
	align-items: center;
	gap: ${ vars.spacing.sm };
	padding: ${ vars.spacing.sm } ${ vars.spacing.md };
	border: 1px solid light-dark(${ vars.colors.gray[3] }, ${ vars.colors.dark[4] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.gray[0] }, ${ vars.colors.dark[6] });

	&[data-state="checking"] {
		border-color: ${ vars.colors.harbor[4] };
	}

	&[data-state="success"] {
		border-color: ${ vars.colors.green[4] };
		background: light-dark(${ vars.colors.green[0] }, ${ vars.colors.dark[6] });
	}

	&[data-state="error"] {
		border-color: ${ vars.colors.red[4] };
		background: light-dark(${ vars.colors.red[0] }, ${ vars.colors.dark[6] });
	}
`

export const groupHeading = css`
	display: flex;
	align-items: center;
	gap: ${ vars.spacing.xs };
`

export const section = css`
	display: flex;
	flex-direction: column;
	gap: ${ vars.spacing.sm };
	padding: ${ vars.spacing.md };
	border: 1px solid light-dark(${ vars.colors.gray[6] }, ${ vars.colors.dark[1] });
	border-radius: ${ vars.radius.md };
	background: light-dark(${ vars.colors.white }, ${ vars.colors.dark[7] });
`

export const row = css`
	display: flex;
	align-items: center;
	gap: ${ vars.spacing.sm };
	padding: ${ vars.spacing.xs } 0;
	border-bottom: 1px solid light-dark(${ vars.colors.gray[2] }, ${ vars.colors.dark[4] });

	&:last-child {
		border-bottom: 0;
	}
`

export const mark = css`
	@keyframes api-status-ripple {
		from {
			opacity: 0.7;
			transform: scale(0.55);
		}
		to {
			opacity: 0;
			transform: scale(1.4);
		}
	}

	position: relative;
	display: grid;
	flex: none;
	place-items: center;
	width: 1.75rem;
	height: 1.75rem;
	color: light-dark(${ vars.colors.gray[7] }, ${ vars.colors.dark[0] });
	animation-delay: inherit;

	&[data-state="checking"] {
		color: light-dark(${ vars.colors.harbor[7] }, ${ vars.colors.harbor[2] });
	}

	&[data-state="success"] {
		color: light-dark(${ vars.colors.green[9] }, ${ vars.colors.green[4] });
	}

	&[data-state="error"] {
		color: light-dark(${ vars.colors.red[9] }, ${ vars.colors.red[4] });
	}

	&[data-state="success"]::after,
	&[data-state="error"]::after {
		content: "";
		position: absolute;
		inset: -3px;
		border: 2px solid currentColor;
		border-radius: 999px;
		animation: api-status-ripple 0.6s ease both;
		animation-delay: inherit;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		&::after {
			animation: none;
		}
	}
`

export const glyph = css`
	@keyframes api-status-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes api-status-pop {
		0% {
			opacity: 0;
			transform: scale(0.2) rotate(-18deg);
		}
		70% {
			opacity: 1;
			transform: scale(1.15) rotate(0deg);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes api-status-shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-3px);
		}
		75% {
			transform: translateX(3px);
		}
	}

	display: block;

	${ mark }[data-state="checking"] & {
		animation: api-status-spin 0.8s linear infinite;
	}

	${ mark }[data-state="success"] & {
		animation: api-status-pop 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both;
		animation-delay: inherit;
	}

	${ mark }[data-state="error"] & {
		animation: api-status-shake 0.45s ease both;
		animation-delay: inherit;
	}

	@media (prefers-reduced-motion: reduce) {
		animation: none;
	}
`

export const list = css`
	display: flex;
	flex-direction: column;
`
