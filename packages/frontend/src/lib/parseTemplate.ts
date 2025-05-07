export function safeTemplateParse(template: string, context: Record<string, any>): string {
	// Replace all {{#if var}} ... {{/if}} blocks (tolerant of whitespace and newlines)
	template = template.replace(/\{\{#if\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
		return context[key] ? content : ""
	})
	// Remove any unmatched {{#if ...}} or {{/if}}
	template = template.replace(/\{\{#if\s+\w+\s*\}\}/g, "")
	template = template.replace(/\{\{\/if\}\}/g, "")
	// Replace all {{{var}}} with values or blank (tolerant of whitespace)
	template = template.replace(/\{\{\{\s*(\w+)\s*\}\}\}/g, (_, key) => {
		return context[key] ?? ""
	})
	// Replace all {{var}} with values or blank (tolerant of whitespace)
	template = template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
		return context[key] ?? ""
	})
	return template
}
