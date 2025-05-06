import vkbeautify from "vkbeautify"

function isDirective(line: string) {
	return /^\s*\{\{[#/]?(?:if|each|with|unless)[^}]*\}\}\s*$/.test(line) || /^\s*\{\{else\}\}\s*$/.test(line) || /^\s*\{\{\/(?:if|each|with|unless)\}\}\s*$/.test(line)
}

export function formatHtmlWithDirectives(html: string): string {
	// Step 1: Insert line breaks before and after directives
	let preprocessed = html
		// Handle opening and closing if/each/with/unless blocks and else
		.replace(/(\{\{[#/]?(?:if|each|with|unless)[^}]*\}\})/g, "\n$1\n")
		.replace(/(\{\{else\}\})/g, "\n$1\n")

	// Remove duplicate newlines
	preprocessed = preprocessed.replace(/\n{2,}/g, "\n")

	// Step 2: Beautify
	const beautified = vkbeautify.xml(preprocessed)

	// Step 3: Indent directives to match the next/previous HTML block
	const lines = beautified.split("\n")
	const result: string[] = []

	for(let i = 0; i < lines.length; i++) {
		const line = lines[i]
		const trimmed = line.trim()
		if(
			/^\{\{#(?:if|each|with|unless)[^}]*\}\}$/.test(trimmed)
		) {
			// Opening block: use next non-directive line's indent
			let nextIndent = ""
			for(let j = i + 1; j < lines.length; j++) {
				if(lines[j].trim() && !isDirective(lines[j])) {
					nextIndent = lines[j].match(/^\s*/)?.[0] ?? ""
					break
				}
			}
			result.push(nextIndent + trimmed)
		} else if(trimmed === "{{else}}") {
			// Else: use next non-directive line's indent
			let nextIndent = ""
			for(let j = i + 1; j < lines.length; j++) {
				if(lines[j].trim() && !isDirective(lines[j])) {
					nextIndent = lines[j].match(/^\s*/)?.[0] ?? ""
					break
				}
			}
			result.push(nextIndent + trimmed)
		} else if(/^\{\{\/(?:if|each|with|unless)\}\}$/.test(trimmed)) {
			// Closing block: use previous non-directive line's indent
			let prevIndent = ""
			for(let j = i - 1; j >= 0; j--) {
				if(lines[j].trim() && !isDirective(lines[j])) {
					prevIndent = lines[j].match(/^\s*/)?.[0] ?? ""
					break
				}
			}
			result.push(prevIndent + trimmed)
		} else {
			result.push(line)
		}
	}

	// Step 4: Remove blank lines directly before or after a directive
	const cleaned: string[] = []
	for(let i = 0; i < result.length; i++) {
		const curr = result[i]
		const prev = i > 0 ? result[i - 1] : ""
		const next = i < result.length - 1 ? result[i + 1] : ""

		// Remove blank line before or after a directive
		if(
			curr.trim() === "" &&
			((next && isDirective(next)) || (prev && isDirective(prev)))
		) {
			continue
		}
		cleaned.push(curr)
	}

	// Step 5: Trim leading/trailing empty lines and ensure one trailing empty line
	let linesToProcess = [...cleaned] // Use a copy of cleaned

	// Trim leading empty lines (lines that are empty or only whitespace)
	while(linesToProcess.length > 0 && linesToProcess[0].trim() === "") {
		linesToProcess.shift()
	}

	// Trim all trailing lines that are empty or only whitespace
	while(linesToProcess.length > 0 && linesToProcess[linesToProcess.length - 1].trim() === "") {
		linesToProcess.pop()
	}

	// If the input was all empty lines or became empty after trimming leading/trailing empty lines
	if(linesToProcess.length === 0) {
		return "\n" // Return a single empty line represented by a newline character
	}

	// Add one actual empty line string to be the last line before joining.
	// .join("\n") will ensure this results in a string ending with a newline,
	// making the last line effectively empty.
	linesToProcess.push("")

	return linesToProcess.join("\n")
}
