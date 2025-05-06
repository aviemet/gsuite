import { CodeHighlight, CodeHighlightProps } from "@mantine/code-highlight"

interface HtmlHighlightProps extends Omit<CodeHighlightProps, "language"> {
	code: string
}

export function HtmlHighlight({ code, ...props }: HtmlHighlightProps) {
	return <CodeHighlight code={ code } language="handlebars" { ...props } />
}
