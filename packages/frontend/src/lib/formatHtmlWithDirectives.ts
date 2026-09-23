import { html_beautify, HTMLBeautifyOptions } from "js-beautify"

export function formatHtmlWithDirectives(html: string): string {
	const trimmedHtml = html.trim()

	if(trimmedHtml === "") {
		return "\n" // Consistent handling for empty or whitespace-only input
	}

	const beautifyOptions: HTMLBeautifyOptions = {
		indent_size: 2,
		indent_char: " ",
		indent_handlebars: true, // Essential for {{...}} directive formatting
		wrap_line_length: 100, // A sensible default, can be configured
		max_preserve_newlines: 1, // Prevents js-beautify from creating too many consecutive blank lines
		// preserve_newlines: true, // Default is true. Set to false if you want js-beautify to be more aggressive.
	}

	// Let js-beautify handle the core formatting and newline management.
	// It typically adds a trailing newline to non-empty output by default.
	const beautified = html_beautify(trimmedHtml, beautifyOptions)

	return beautified
}
