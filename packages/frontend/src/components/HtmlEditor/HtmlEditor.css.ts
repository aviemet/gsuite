import { css } from "@linaria/core"

import { vars } from "@/frontend/lib/theme"

export const editorRoot = css`
	position: relative;
	border: 1px solid ${ vars.colors.gray[4] };
	border-radius: ${ vars.radius.md };
	overflow: hidden;
	min-height: 16rem;
	background: ${ vars.colors.white };
	box-shadow: 0 1px 2px rgba(22, 40, 69, 0.06);
	cursor: text;
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
	font-size: 0.9em;
	line-height: 1.5;
	box-sizing: border-box;

	&:focus-within {
		border-color: ${ vars.colors.harbor[5] };
	}

	textarea,
	pre {
		margin: 0;
		padding: ${ vars.spacing.sm };
		border: 0;
		font: inherit;
		line-height: inherit;
		tab-size: 2;
		white-space: pre-wrap;
		word-break: keep-all;
		overflow-wrap: break-word;
		box-sizing: border-box;
	}

	textarea {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		resize: none;
		overflow: hidden;
		background: transparent;
		color: transparent;
		caret-color: ${ vars.colors.dark[7] };
		outline: none;
		-webkit-text-fill-color: transparent;
	}

	pre {
		position: relative;
		min-height: 16rem;
		pointer-events: none;
		overflow: hidden;
		color: ${ vars.colors.dark[7] };
	}

	.token.comment,
	.token.prolog,
	.token.doctype,
	.token.cdata {
		color: ${ vars.colors.gray[6] };
	}

	.token.punctuation {
		color: ${ vars.colors.gray[6] };
	}

	.token.tag,
	.token.boolean,
	.token.number,
	.token.constant {
		color: ${ vars.colors.harbor[7] };
	}

	.token.attr-name {
		color: ${ vars.colors.violet[7] };
	}

	.token.attr-value,
	.token.string {
		color: ${ vars.colors.teal[8] };
	}

	.token.operator,
	.token.entity,
	.token.url {
		color: ${ vars.colors.orange[8] };
	}
`
